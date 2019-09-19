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
  var _ = require('underscore');

  const appData = this.dao.getAppData();
  const sprintTasks = appData.sprints[appData.currentSprintId].sprintTasks;
  const tasks = _.map(sprintTasks, sprintTask => appData.tasks[sprintTask.taskId]);

  return _.sortBy(_.map(sprintTasks, sprintTask =>appData.tasks[sprintTask.taskId]),
                   task => (task.complete) ? 1 : 0);

  return tasks;
}

DataUtil.prototype.getTasksForCurrentSprintAsMap = function() {
  var _ = require('underscore');
  return _.indexBy(this.getTasksForCurrentSprint(), 'id');
}

DataUtil.prototype.getAllTasks = function() {
  var _ = require('underscore');

  const sprintTaskMap = this.getTasksForCurrentSprintAsMap();
  const allTasks    = this.dao.getAllTasks();

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
