/**
 *
 * @author Philip M. Turner
 *
 */


/* task update 3 'We struck gold today' */


function UpdateCommand(appData) {
  this.appData  = appData;
  this.dao      = require('../dao/');
  this.util     = require('../utils/command-util');
}

UpdateCommand.prototype.run = async function (args) {
  if (Object.keys(this.appData.allTasks).length === 0) {
    console.log('No tasks present to update!');
    process.exit();
  }

  if (args.i) { //Flag for interactive task creation...
    const argPromptArr = [
      {argKey: 'id', prompt: 'What is the id of the task you want to update?: ', value: null},
      {argKey: 'comment', prompt: 'Please type your comment: ', value: null},
      {argKey: 'pointUpdate', prompt: '+/- N points? i.e (-2): ', value: null},
      {argKey: 'shouldRelateParent', prompt: 'Would you like to relate this to a parent task? (y/n): ', value: false}
    ];

    await this.util.constructArgsInteractively(args, argPromptArr)
      .then( (constructedArgs) => args = constructedArgs);
  }

  if (args.shouldRelateParent) { /* User would like to relate this task to a parent task... */
    const relateParentPrompt = [
      {argKey: 'relatedParentTaskId', prompt: 'What is the id of the parent task?: ', value: null}
    ];
    printProjects();
    await this.util.constructArgsInteractively(args, relateParentPrompt)
      .then( (constructedArgs) => args = constructedArgs);
  }

  this.dao.updateTask(buildUpdateModel(args));
}

//TODO: Put in ./builders/
function buildUpdateModel(args) {
  const taskId             = (args.i) ? args.id : process.argv[3];
  const task               = require('../dao').getAllTasks()[taskId];
  const comment            = (args.i) ? args.comment : process.argv[4];
  const shouldRelateParent = args.shouldRelateParent;
  var pointUpdate          = (args.i) ? args.pointUpdate : Number(process.argv[5]);

  if (isNaN(pointUpdate))
    pointUpdate = null;

  const updateModel = {
    taskId: taskId,
    comment: comment,
    pointUpdate: pointUpdate,
    shouldRelateParent: args.shouldRelateParent,
    relatedParentTaskId: args.relatedParentTaskId,
    annotation: buildAnnotationModel(comment, pointUpdate, task.points)
  };
  return updateModel;
}

//TODO: Put in ./builders/
function buildAnnotationModel(comment, pointUpdate, pointsLeft) {
  return {
    comment: comment,
    date: require('moment-timezone')().tz(config.timezone),
    pointUpdate: getPointUpdateString(pointUpdate, pointsLeft),
    updatedBy: config.name
  }
}

//TODO: Put in ./builders/
function getPointUpdateString(pointUpdate, pointsLeft) {
  if (pointUpdate === 0 || pointUpdate === null)
    return `Points remaining unchanged. (${pointsLeft} points left.)`;
  else if (pointUpdate > 0)
    return `Added ${pointUpdate} point(s) to task. (${pointsLeft} points left.)`;
  else
    return `Subtracted ${-pointUpdate} point(s) to task. (${pointsLeft} points left.)`;
}

function printProjects() {
  const appData = require('../dao').getAppData();
  appData.projects.forEach((projectId) => {
    const project = appData.allTasks[projectId];
    console.log(`${project.title} (${project.id})`);
  });
}


module.exports = UpdateCommand;
