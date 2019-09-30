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

module.exports = Task;
