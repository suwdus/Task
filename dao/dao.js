/**
 *
 * @author Philip M. Turner
 *
 * Data access layer for Task.
 *
 */

const EMPTY_DATA_SCHEMA =
{
  allTasks: {},       /* All tasks which haven't been archived */
  archivedTasks: {},  /* Un-permanently deleted tasks */
  projects: []        /* An array of 'Project' task ids. */
}

function Dao() {}

Dao.prototype.createTask = function(task, doS3Upload) {
  const config = require(APP_CONFIG_PATH);

  if (doS3Upload) {
    //TODO: Implement...
  }

  const appData = this.getAppData();

  //TODO: Validate data...
  var id = 1;
  if (Object.keys(appData.allTasks).length > 0) { /*Get next id */
    var _ = require('underscore');
    id = _.max(Object.values(appData.allTasks),
        (task) => { return task.id; }).id + 1;
  }

  task.id               = id;
  appData.allTasks[id]  = task; /* Add task */

  if (task.project)
    appData.projects.push(task.id);

  /* If this task should be a child of an existing task/project, relate them */
  if (task.parentTaskId) {
    var parentTask = appData.allTasks[task.parentTaskId];
    if (parentTask)
      parentTask.subtasks.push(task.id);
    else
      throw `Parent project with id ${task.parentProjectId} does not exist`;
  }

  const json = JSON.stringify(appData);

  require('fs').promises.writeFile(config.taskFile, json)
  .then(() => {
    console.log('1 task created');
  }).catch((err) => {
    console.log('Could not create task', err);
  });

}

/* Delete tasks from ~/.tasks. */
Dao.prototype.clearTasks = function() {
  const config    = require(APP_CONFIG_PATH);
  const taskFile  = config.taskFile;
  const schema    = JSON.stringify(EMPTY_DATA_SCHEMA);

  require('fs').promises
  .writeFile(taskFile, schema)
  .then(() => console.log('Successfully cleared all tasks from ' + taskFile))
  .catch((err) => console.log('Error writing data to task file', err));
}

/* Schema A/O (09/23/2019)
 * {
 *   allTasks: { n : Task, n+1 : Task ...},
 *   activeTasks: { n : Task, n+1 : Task ...},  -> Subset of `allTasks`.
 *   archivedTasks: { n : Task, n+1 : Task ...} -> Subset of `allTasks`.
 *   projects: { n : Task, ...}                 -> Contains project tasks only.
 * }
 *
 * Will return the data structured as above.
 *
 */
Dao.prototype.getAppData = function(filter) {
  const taskJsonPath = require(APP_CONFIG_PATH).taskFile;
  return require(taskJsonPath);
}

Dao.prototype.updateTask = function(appData) {
  const modData   = JSON.stringify(appData);
  const taskFile  = config.taskFile;

  require('fs').promises
  .writeFile(taskFile, modData)
  .then(() => console.log('Task successfully updated.'))
  .catch((err) => console.log('Error updating task', err));
}

Dao.prototype.deleteTask = function(taskId) {
  var appData = this.getAppData();
  delete appData.allTasks[taskId];
  this.updateTask(appData);
}

Dao.prototype.completeTask = function(id) {
  var appData   = this.getAppData();
  var allTasks  = appData.allTasks;
  if (allTasks[id])
    delete allTasks[id];
  else
    throw `Task ${id} does not exist!!!`;

  const taskFile  = config.taskFile;
  const modData   = JSON.stringify(appData);

  require('fs').promises
  .writeFile(taskFile, modData)
  .then(() => console.log('1 task deleted.'))
  .catch((err) => console.log('Error deleting task', err));

}

module.exports = Dao;
