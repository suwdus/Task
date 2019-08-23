/**
 *
 * @author Philip M. Turner
 *
 * Data access layer for Task.
 *
 */

const DATA_SCHEMA =
{
  allTasks: {},
  activeTasks: {},
  archivedTasks: {},
  projects: {}
}

function Dao() {}

Dao.prototype.createTask = function(taskInput, doS3Upload) {

  if (doS3Upload) {
    //TODO: Implement...
  }

  this.getTasks()
    .then((tasks) => {

      //TODO: Validate data, implement nextID() function.
      const id = Object.keys(tasks.allTasks).length;
      tasks.allTasks[id] = taskInput;
      const tasksJSON = JSON.stringify(tasks);

      require('fs').promises
        .writeFile(require('./config').TASK_FILE, tasksJSON)
        .then((data) => {
          console.log('1 task created');
        }).catch((err) => {
          console.log('Could not create task', err);
        });
    });
}

/* Delete tasks from ~/.tasks. */
Dao.prototype.clearTasks = function() {
  const taskFile  = require('./config').TASK_FILE;
  const schema    = JSON.stringify(DATA_SCHEMA);

  require('fs').promises
    .writeFile(taskFile, schema)
    .catch((err) => {
      console.log('Error writing data to task file', err);
    });
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
  return require('fs').promises
    .readFile(require('./config').TASK_FILE)
    .then((dataString) => {
      return JSON.parse(dataString);
    }).catch((err) => {
      console.log('Error reading data from task file', err);
    });
}

Dao.prototype.updateTask = function() {
  //TODO: Implement...
}

Dao.prototype.deleteTask = function() {
  //TODO: Implement...
}



module.exports = Dao;
