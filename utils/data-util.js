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

  const tasks = _.map(sprintTasks, (sprintTask) => {
    return appData.tasks[sprintTask.taskId]
  });
  return tasks;
}

module.exports = new DataUtil();
