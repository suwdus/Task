/**
 *
 * @author Philip M. Turner
 *
 * Data access layer for Task.
 *
 */

const EMPTY_DATA_SCHEMA =
{
  allTasks: {},
  activeTasks: {},
  archivedTasks: {},
  projects: {}
}


function Dao() {}

Dao.prototype.createTask = function(taskInput, doS3Upload) {
  const config = require(APP_CONFIG_PATH);

  if (doS3Upload) {
    //TODO: Implement...
  }

  const tasks = this.getTasks();

  //TODO: Validate data, implement nextID() function.
  const id            = Object.keys(tasks.allTasks).length;
  tasks.allTasks[id]  = taskInput; /* Add task */

  const json = JSON.stringify(tasks);

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
Dao.prototype.getTasks = function() {
  const taskJsonPath = require(APP_CONFIG_PATH).taskFile;
  return require(taskJsonPath);
}

Dao.prototype.updateTask = function() {
  //TODO: Implement...
}

Dao.prototype.deleteTask = function() {
  //TODO: Implement...
}

module.exports = Dao;
