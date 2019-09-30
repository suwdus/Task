/**
 *
 * Performs various filters on tasks and returns resulting list.
 *
 * @author Philip M. Turner
 *
 */

function DataUtil() {
    this.dao = require('../dao');
}

DataUtil.prototype.getTasksForCurrentSprint = function() {
    const _         = require('underscore'),
        appData     = this.dao.getAppData(), //Would be nice to simply getSprints from appData.
        sprintTasks = appData.sprints[appData.currentSprintId].sprintTasks,
        tasks       = _.map(sprintTasks, sprintTask => appData.tasks[sprintTask.taskId]);

    return _.sortBy(_.map(sprintTasks, sprintTask =>appData.tasks[sprintTask.taskId]),
                               task => (task.complete) ? 1 : 0);

}

DataUtil.prototype.getTasksForCurrentSprintAsMap = function() {
    const _ = require('underscore');

    return _.indexBy(this.getTasksForCurrentSprint(), 'id');
}

DataUtil.prototype.getAllTasks = function() {
    const _       = require('underscore'),
    sprintTaskMap = this.getTasksForCurrentSprintAsMap(),
    allTasks      = this.dao.getAllTasks();

    var allTasksWithMetadata = _.map(allTasks, function(task) {
        if(! _.isUndefined(sprintTaskMap[task.id])) {
            task.belongsToCurrentSprint = true;
        }
        return task;
    });

    //Put sprint tasks in the front of the list.
    allTasksWithMetadata = _.sortBy(allTasksWithMetadata, function(task) {
        return (task.belongsToCurrentSprint === true) ? 0 : 1;
    });

    return allTasksWithMetadata;

}

module.exports = new DataUtil();
