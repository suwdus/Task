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

  if (args.i) { //Flag for interactive task creation...
    const argPromptArr = [
      {argKey: 'id', prompt: 'What is the id of the task you want to update?: ', value: null},
      {argKey: 'comment', prompt: 'Please type your comment: ', value: null},
      {argKey: 'pointUpdate', prompt: '+/- N points? i.e (-2): ', value: null},
      {argKey: 'project', prompt: 'Would you like to relate this to a project? (y/n): ', value: false}
    ];

    await this.util.constructArgsInteractively(args, argPromptArr)
      .then( (constructedArgs) => args = constructedArgs);
  }

  if (args.project) { /* User would like to relate this task to a project... */
    const argPromptArr = [
      {argKey: 'relatedProjectId', prompt: 'What is the id of the parent task?: ', value: null}
    ];

    /* Log projects to the console for the user's selection */
    console.log(this.dao.getProjects());

    await this.util.constructArgsInteractively(args, argPromptArr)
      .then( (constructedArgs) => args = constructedArgs);
  }



  //Construct data for task update...
  const taskId        = (args.i) ? args.id : process.argv[3];
  const comment       = (args.i) ? args.comment : process.argv[4];
  const relateProject = args.project;

  var pointUpdate   = (args.i) ? args.pointUpdate : Number(process.argv[5]);

  if (isNaN(pointUpdate))
    pointUpdate = null;

  var task = this.appData.allTasks[taskId];

  /* Make task modifications */
  task.points += (!pointUpdate) ? 0 : pointUpdate;

  task.annotations.push(createAnnotation(comment, pointUpdate, task.points));

  if (relateProject) {
    var parentTask = this.appData.allTasks[args.relatedProjectId];
    parentTask.subtasks.push(task.id);
    this.dao.updateTask(parentTask); /* Update parent task */
    task.parentTaskId = parentTask.id;
  }

  this.dao.updateTask(task);
}

/* TODO: Utilize single object in params */
function createAnnotation(comment, pointUpdate, pointsLeft) {
  return {
    comment: comment,
    date: require('moment-timezone')().tz(config.timezone),
    pointUpdate: getPointUpdateString(pointUpdate, pointsLeft),
    updatedBy: config.name
  }
}

function getPointUpdateString(pointUpdate, pointsLeft) {
  if (pointUpdate === 0 || pointUpdate === null)
    return `Points remaining unchanged. (${pointsLeft} points left.)`;
  else if (pointUpdate > 0)
    return `Added ${pointUpdate} point(s) to task. (${pointsLeft} points left.)`;
  else
    return `Subtracted ${-pointUpdate} point(s) to task. (${pointsLeft} points left.)`;
}

module.exports = UpdateCommand;
