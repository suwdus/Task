/**
 *
 * @author Philip M. Turner
 *
 * Data access layer for Task.
 *
 */

const EMPTY_DATA_SCHEMA =
{
    currentSprintId: null,
    tasks: {},        /* Mutable task store. Archived tasks are flaged but not deleted. */
    projects: [], /* An array of project task ids. */
    sprints: {},    /* Mutable store for sprints. */
}

function Dao() {
}

Dao.prototype.createTask = function(task, doS3Upload) {
    const appData = this.getAppData();

    //TODO: Validate data...

    var id = 0; /* id will be `0` when adding the first task */
    if (Object.keys(appData.tasks).length > 0) { /*Get next id */
        var _ = require('underscore');
        id = _.max(Object.values(appData.tasks),
                (task) => { return task.id; }).id + 1;
    }

    task.id           = id;
    appData.tasks[id] = task; /* Add task */

    if (task.project)
        appData.projects.push(task.id);

    /* If this task should be a child of an existing task/project, relate them */
    if (task.parentTaskId) {
        var parentTask = appData.tasks[task.parentTaskId];
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
            require('../utils/s3-util').uploadData();
        }
    }).catch((err) => {
        console.log('Could not create task', err);
    });

}

Dao.prototype.commitSprint = function(sprintId, sprintModel) {
    const appData = this.getAppData(),
        appDataMod = {...appData};
    appDataMod.sprints[sprintId] = sprintModel;

    const json = JSON.stringify(appDataMod);

    require('fs').promises.writeFile(config.taskFile, json)
    .then(() => {
        console.log('Sprint committed');
    }).catch((err) => {
        console.log('Could not commit sprint', err);
    });
}
Dao.prototype.createSprint = function(sprintModel) {
    var appData = this.getAppData();

    var id = 0; /* id will be `0` when adding the first sprint */
    if (Object.keys(appData.sprints).length > 0) { /*Get next id */
        var _ = require('underscore');
        id = _.max(Object.values(appData.sprints),
                (sprint) => { return sprint.id; }).id + 1;
    }

    sprintModel.id = id;
    appData.sprints[id] = sprintModel;

    const json = JSON.stringify(appData);

    require('fs').promises.writeFile(config.taskFile, json)
    .then(() => {
        console.log('1 sprint created');
    }).catch((err) => {
        console.log('Could not create sprint', err);
    });
}

Dao.prototype.selectSprint = function(sprintId) {
    var _ = require('underscore');

    const appData = this.getAppData();
    if (_.isEmpty(appData.sprints)) {
        console.log(`No sprints available to select from`);
        process.exit();
    } else if (_.isUndefined(appData.sprints[sprintId])) {
        console.log(`Sprint with id ${sprintId} does not exist`);
        process.exit();
    }

    config.tmp.selectedSprintId = sprintId;
    const json = JSON.stringify(config);

    require('fs').promises.writeFile(config.configFile, json)
    .then(() => {
        console.log(`sprint ${sprintId} selected`);
    }).catch((err) => {
        console.log('Could not select sprint', err);
    });

    if (true) { /* Set current sprint ID for team */
        appData.currentSprintId = sprintId;

        const appJson = JSON.stringify(appData);
        require('fs').promises.writeFile(config.taskFile, appJson)
        .then(() => {
            console.log('updated current sprint id for team');
        }).catch((err) => {
            console.log('Could not update current sprint id for team', err);
        });
    }
}

Dao.prototype.addSprintTask = function(sprintTaskModel) {
    var _ = require('underscore');

    //Validation checks: User has selected a sprint id already.

    if (_.isNull(config.tmp.selectedSprintId) ||
            _.isUndefined(config.tmp.selectedSprintId)) {
        console.log(`Please select a sprint`);
        process.exit();
    }

    var appData = this.getAppData();

    //Validation checks: Task exists.

    if (_.isUndefined(appData.tasks[sprintTaskModel.taskId])) {
        console.log(`Task with id ${sprintTaskModel.taskId} does not exist.`);
        process.exit();
    }

    const sprint = appData.sprints[config.tmp.selectedSprintId];

    //Validation checks: Task already in sprint.
    if (sprint.sprintTasks[sprintTaskModel.taskId]) {
        console.log(`Task with id ${sprintTaskModel.taskId} already belongs to sprint.`);
        process.exit();
    }

    sprint.sprintTasks[sprintTaskModel.taskId] = sprintTaskModel;

    const json = JSON.stringify(appData);

    require('fs').promises.writeFile(config.taskFile, json)
    .then(() => {
        console.log('task added to sprint');
    }).catch((err) => {
        console.log('error adding task to sprint', err);
    });
}

Dao.prototype.removeTaskFromSprint = function(taskId) {
    var _ = require('underscore');

    //Validation checks: User has selected a sprint id already.
    if (_.isNull(config.tmp.selectedSprintId) ||
            _.isUndefined(config.tmp.selectedSprintId)) {
        console.log(`Please select a sprint`);
        process.exit();
    }

    var appData    = this.getAppData();
    const sprint = appData.sprints[config.tmp.selectedSprintId];

    //Delete task from sprint...
    delete sprint.sprintTasks[taskId];

    const json = JSON.stringify(appData);

    require('fs').promises.writeFile(config.taskFile, json)
    .then(() => {
        console.log('task removed from sprint');
    }).catch((err) => {
        console.log('error removing task from sprint', err);
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

Dao.prototype.getAppData = function(filter) { //TODO
    //console.log('Getting app data'); //TODO: Reduce # of calls.
    const _    = require('underscore'),
          Task = require('../logic-objects/task'),
          data = require(config.taskFile), //Load data from file.
          tasks = Object.keys(data.tasks).map( taskId => new Task(data.tasks[taskId])),
          taskMap = _.indexBy(tasks, 'id');

    return {
        ...data,
        tasks: taskMap
    }
}

Dao.prototype.getAllTasks = function() {
    return Object.values(this.getAppData().tasks);
}

Dao.prototype.updateTask = async function(update) {

    const appDataModel = this.getAppData(),
          taskModel    = appDataModel.tasks[update.taskId],
          taskId       = taskModel.id;

    /* Make task model modifications */
    taskModel.points += (!update.pointUpdate) ? 0 : update.pointUpdate;
    taskModel.annotations.push(update.annotation);
    //console.log(appDataModel.tasks[update.taskId]);

    if (update.shouldRelateParent) {
        const parentTaskModel = appDataModel.tasks[update.relatedParentTaskId];
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
    var _ = require('underscore');

    return new Promise( (resolve, reject) => {

        var appDataModel         = this.getAppData();
        var shouldDeleteSubtasks = true; //TODO: Make configurable.

        const task = appDataModel.tasks[taskId];

        if (! task)
            throw `task with id ${taskId} does not exist!!`;

        const cleanupTaskFromSprints = (appDataModel, taskId) => {
            const sprints = appDataModel.sprints;
            appDataModel.sprints = _.forEach(sprints, (sprint) => {
                delete sprint.sprintTasks[taskId];
            });
        }

        const deleteRecursive = (task) => {
            if (! task || !appDataModel.tasks[task.id]) {
                console.log(`Task undefined or unpresent in appDataModel, returning`); return;
            }
            if (shouldDeleteSubtasks && task.subtasks.length > 0) {
                console.log(`shouldDeleteSubtasks flag is true, deleteing subtasks...`);
                task.subtasks.forEach((subtaskId) => {
                    deleteRecursive(appDataModel.tasks[subtaskId]);
                });
            }
            /* If task is a project , remove it from the project list */
            if (task.project && appDataModel.projects.includes(task.id)) {
                const idx                     = appDataModel.projects.indexOf(task.Id);
                const removedTaskId = appDataModel.projects.pop(idx);
                console.log(`Removing task with id ${removedTaskId} from project list`);
            }

            console.log(`Removing task with id ${task.id}`);

            cleanupTaskFromSprints(appDataModel, task.id);
            delete appDataModel.tasks[task.id];
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
    const fs       = require('fs'),
          appData  = JSON.parse(fs.readFileSync(config.taskFile).toString()),
          tasks    = appData.tasks;

    if (!tasks[id])
        throw `Task ${id} does not exist!!!`;

    const task = tasks[id];

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

    const modData = JSON.stringify(appData);

    /* Write modified data to disk */
    require('fs').promises
    .writeFile(config.taskFile, modData)
    .then(() => console.log('task successfully completed.'))
    .catch((err) => console.log('error completing task', err));

}

module.exports = new Dao();
