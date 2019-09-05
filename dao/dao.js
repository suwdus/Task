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

function Dao() {
}

Dao.prototype.createTask = function(task, doS3Upload) {
  const appData = this.getAppData();

  //TODO: Validate data...

  var id = 0; /* id will be `0` when adding the first task */
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

    if (doS3Upload) {
      var S3Util = require('../utils/s3-util');
      var s3Util = new S3Util();
      s3Util.uploadData();
    }
  }).catch((err) => {
    console.log('Could not create task', err);
  });

}

/* Delete tasks from ~/.tasks. */
Dao.prototype.clearTasks = function() {
  const schema = JSON.stringify(EMPTY_DATA_SCHEMA);

  require('fs').promises
  .writeFile(config.taskFile, schema)
  .then(() => console.log('Successfully cleared all tasks from ' + config.taskFile))
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
  const taskJsonPath = config.taskFile;
  return require(taskJsonPath);
}

Dao.prototype.getAllTasks = function() {
  return Object.values(this.getAppData().allTasks);
}

Dao.prototype.updateTask = async function(update) {

  const appDataModel = this.getAppData();
  const taskModel    = appDataModel.allTasks[update.taskId];
  /* Task ID of the task we're modifying */
  const taskId       = taskModel.id;

  /* Make task model modifications */
  taskModel.points += (!update.pointUpdate) ? 0 : update.pointUpdate;
  taskModel.annotations.push(update.annotation);

  if (update.shouldRelateParent) {
    const parentTaskModel = appDataModel.allTasks[update.relatedParentTaskId];
    //Add task as child of parent task model subtasks if not already present...
    if (! parentTaskModel.subtasks.includes(taskModel.id))
      parentTaskModel.subtasks.push(taskModel.id);
    //Set parent id on this task model...
    taskModel.parentTaskId = parentTaskModel.id;
  }

  const modifiedData = JSON.stringify(appDataModel);

  await require('fs').promises
  .writeFile(config.taskFile, modifiedData)
  .then(() => console.log('Task successfully updated.'))
  .catch((err) => console.log('Error updating task', err));

  if (taskModel.points === 0)
    this.completeTask(taskId);
}

Dao.prototype.deleteTasks = function(taskIds) {
  taskIds.forEach( async (taskId) => {
    await this.deleteTask(taskId);
  });
}

Dao.prototype.deleteTask = function(taskId) {

  return new Promise( (resolve, reject) => {
    var appDataModel              = this.getAppData();
    var shouldDeleteSubtasks = true; //TODO: Make configurable.
    const task = appDataModel.allTasks[taskId];
    if (! task)
      throw `task with id ${taskId} does not exist!!`;

    const deleteRecursive = (task) => {
      if (! task || !appDataModel.allTasks[task.id]) {
        console.log(`Task undefined or unpresent in appDataModel, returning`); return;
      }
      if (shouldDeleteSubtasks && task.subtasks.length > 0) {
        console.log(`shouldDeleteSubtasks flag is true, deleteing subtasks...`);
        task.subtasks.forEach((subtaskId) => {
          deleteRecursive(appDataModel.allTasks[subtaskId]);
        });
      }
      /* If task is a project , remove it from the project list */
      if (task.project && appDataModel.projects.includes(task.id)) {
        console.log(`Removing task with id ${removedTaskId} removed from project list`);
        const idx           = appDataModel.projects.indexOf(task.Id);
        const removedTaskId = appDataModel.projects.pop(idx);
      }

      console.log(`Removing task with id ${task.id}`);

      delete appDataModel.allTasks[task.id];
    }

    deleteRecursive(task);

    require('fs').promises
    .writeFile(config.taskFile, JSON.stringify(appDataModel))
    .then(() => {
      console.log('Task successfully deleted.')
      resolve();
    })
    .catch((err) => {
      console.log('Error deleting task', err)
      reject();
    });
  });
}

Dao.prototype.getProjects = function() {
  return this.getAppData().projects;
}

Dao.prototype.completeTask = function(id) {
  var appData  = this.getAppData();
  var allTasks = appData.allTasks;

  if (!allTasks[id])
    throw `Task ${id} does not exist!!!`;

  const task = allTasks[id];

  if (task.points === 0) { /* Set completion fields on the task. */
    task.complete = true;

    task.annotations.push({
      comment: '{bot}> task complete. mission complete. on to other work.',
      date: require('moment')(),
      pointUpdate: '0 points left, task complete',
      updatedBy: 'bot'
    });

    task.completionDate = require('moment')();
  }

  const modData   = JSON.stringify(appData);

  /* Write modified data to disk */
  require('fs').promises
  .writeFile(config.taskFile, modData)
  .then(() => console.log('task successfully completed.'))
  .catch((err) => console.log('error completing task', err));

}

module.exports = new Dao();
