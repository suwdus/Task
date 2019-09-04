/**
 *
 * @author Philip M. Turner
 *
 */


/* task add|a */

const moment       = require('moment-timezone');
const CalendarUtil = require('../utils/calendar-util');

function AddCommand(appData) {
  this.appData      = appData;
  this.dao          = require('../dao/');
  this.util         = require('../utils/command-util');
  this.calendarUtil = new CalendarUtil();
}

AddCommand.prototype.run = async function (args) {

  const calendarTasks = Object.values(require('../dao').getAppData().allTasks);
  await this.calendarUtil.getCalendarView(calendarTasks)
            .then((calendarOutput) =>  {
              console.log(calendarOutput);
            });

  if (args.i) { //Flag for interactive task creation...
    const argPromptArr = [
      {argKey: 'title', prompt: 'What is the title of your task?: ', value: null},
      {argKey: 'upload', prompt: 'Should we upload your tasks to S3? (y/n): ', value: false},
      {argKey: 'dueDate', prompt: 'When is this task due? (YYYY-MM-DD): ', value: null},
      {argKey: 'project', prompt: 'Is this a project task? (y/n): ', value: null},
      {argKey: 'points', prompt: 'How many points does this task require?: ', value: 0}
    ];

    await this.util.constructArgsInteractively(args, argPromptArr)
      .then( (constructedArgs) => args = constructedArgs)
      .catch( (err) => {
        console.log(err);
        process.exit();
      });
  }

  validateAddInput(args);
  const doS3Upload = argValue(args.upload, args.u);

  this.dao.createTask(createTaskFromArgs(args), doS3Upload);
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

function createTaskFromArgs(args) {
  const title           = argValue(args.title, args.t);
  const creationDate    = moment();
  const complete        = false;
  const completionDate  = null;
  /* TODO: Add N hours to time for date GMT to timezone date conversion.
   * If hours are included in dueDate arg do not manipulate the time.
   */
  const dueDate         = moment(argValue(args.dueDate,args.d)).add(7, 'hours');
  const project         = argValue(args.project, args.p);
  const parentTaskId    = argValue(args.parentTaskId, args.P);
  const subtasks        = [];
  const points          = args.points;
  const owner           = (args.owner) ? args.owner : config.name;
  const annotations     = [];
  const isProject       = (project) ? true : false;
  const isActive        = (args.active) ? true : false;

  return {
    title: title,
    creationDate: creationDate,
    dueDate: dueDate,
    complete: complete,
    completionDate: completionDate,
    parentTaskId : parentTaskId,
    project: project,
    subtasks: subtasks,
    points: points,
    owner: owner,
    annotations: annotations,
    isProject: isProject,
    isActive: isActive
  }
}

function argValue(obj1, obj2) {
  return (obj1) ? obj1 : obj2;
}


module.exports = AddCommand;
