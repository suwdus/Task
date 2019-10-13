/**
 *
 * Returns a Promise string for printing tasks to the console.
 *
 */

function Task(task) {
    Object.keys(task).forEach( key =>
        this[key] = task[key]
    );
}

Task.prototype.getStatus = function() {
    const _      = require('underscore'),
          moment = require('moment'),

          lastAnnotation = _.max(this.annotations, (annotation) => {
            return moment(annotation.date).unix()
          }),

          lastAnnotationDate = moment(lastAnnotation.date),
          twoDaysAgo         = moment().subtract({hours: 48});

    if (this.complete)
        return 'Complete';
    else if (_.isEmpty(this.annotations))
        return 'Stalled';
    else if (lastAnnotationDate.isAfter(twoDaysAgo)) {
        return 'In Progress';
    } else {
        return 'Stalled';
    }
}

Task.prototype.getLastUpdatedDateString = function () {
    if (this.annotations.length === 0)
        return 'No updates';

    const moment    = require('moment-timezone'),
          beginDate = this.annotations[0].date,
          reducer   = (maxDate, annotation) =>
                        annotation.date > maxDate ? annotation.date : maxDate,

          lastAnnotationDate = this.annotations.reduce(reducer, beginDate),
          now = moment();

    return moment(lastAnnotationDate).tz(config.timezone).from(now);
}

Task.prototype.getPointsLeftString = function() {
    const dao = require('../dao');
    if (this.subtasks.length === 0) {
        return this.points;
    }

    function getPoints(task) {
        if (! task)
            return 0;

        var count = 0;
        task.subtasks.forEach( (subtaskId) => {
            subtask = dao.getAllTasks()[subtaskId];
            count += getPoints(subtask);
        });
        count += task.points;
        return count;
    }

    return getPoints(this);
}

Task.prototype.getDateString = function() {
    var moment   = require('moment-timezone'),
        timezone = config.timezone;

    return moment(this.dueDate).tz(timezone).format("dddd, MMMM Do YYYY");
}

Task.prototype.getAgeString = function() {
    const moment = require('moment'),
          timeDifference = moment().diff(moment(this.creationDate), 'days');

    return timeDifference.toString();
}

Task.prototype.getProjectString = function () {
    const dao = require('../dao'),
        tasks = dao.getAppData().tasks;

    if (this.project)
        return this.title;
    else if (tasks[this.parentTaskId])
        return `${tasks[this.parentTaskId].title}`;
    else
        return '/';
}

module.exports = Task;
