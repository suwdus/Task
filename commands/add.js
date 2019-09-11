/**
 *
 * @author Philip M. Turner
 *
 */


/* task add|a */

const moment       = require('moment-timezone');

function AddCommand(appData) {
  this.appData      = appData;
  this.dao          = require('../dao/');
  this.util         = require('../utils/command-util');
  this.calendarUtil = require('../utils/calendar-util');
}

AddCommand.prototype.run = async function (args) {

  if (args.i) { //Flag for interactive task creation...
    const argPromptArr = [
      {argKey: 'title', prompt: 'What is the title of your task?: ', value: null},
      {argKey: 'upload', prompt: 'Should we upload your tasks to S3? (y/n): ', value: false},
      {argKey: 'dueDate', prompt: 'When is this task due? (YYYY-MM-DD): ', value: null},
      {argKey: 'project', prompt: 'Is this a project task? (y/n): ', value: false},
      {argKey: 'points', prompt: 'How many points does this task require?: ', value: 0}
    ];

    await this.util.constructArgsInteractively(args, argPromptArr)
      .then( (constructedArgs) => args = constructedArgs)
      .catch( (err) => {
        console.log(err);
        process.exit();
      });
  } else if (! args.project) {
    args.project = false; /* Default project to false */
  }

  validateAddInput(args);
  const doS3Upload = argValue(args.upload, args.u);

  this.dao.createTask(buildTaskModel(args), doS3Upload);

  const calendarTasks = require('../dao').getAllTasks();

  await this.calendarUtil.getCalendarView(calendarTasks)
  .then((calendarOutput) =>  {
    console.log(calendarOutput);
  });

}


function validateAddInput(args) {
  if ( !args.title && !args.t ) {
    throw 'Please supply --title argument';
  }

  if ( !args.dueDate && !args.d ) {
    throw 'Please supply --due-date argument';
  } else if (! moment(argValue(args.dueDate,args.d)).isValid()) {
    throw 'Please enter a valid -due-date argument.';
  }
}

function buildTaskModel(args) {
  const title           = argValue(args.title, args.t);
  const creationDate    = moment();
  const complete        = false;
  const completionDate  = null;
  /* TODO: Add N hours to time for date GMT to timezone date conversion.
   * If hours are included in dueDate arg do not manipulate the time.
   */
  const dueDate         = moment(argValue(args.dueDate,args.d)).add(7, 'hours');
  const project         = args.project;
  const parentTaskId    = argValue(args.parentTaskId, args.P);
  const subtasks        = [];
  const points          = args.points;
  const owner           = (args.owner) ? args.owner : config.name;
  const annotations     = [];

  const TaskModelBuilder = require('../builders/task-model-builder');

  return TaskModelBuilder.build(
      title,
      creationDate,
      dueDate,
      complete,
      completionDate,
      parentTaskId,
      project,
      subtasks,
      points,
      owner,
      annotations
  );
}

function argValue(obj1, obj2) {
  return (obj1) ? obj1 : obj2;
}

module.exports = AddCommand;
