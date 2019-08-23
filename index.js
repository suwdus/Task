/**
 *
 * Description: Entry point into the <task> CLI application.
 *
 * Summary: Allows the user to update and view their tasks.
 *
 *
 * @author Philip M. Turner
 *
 */

const moment                    = require('moment');
const Util                      = require('./util');
const Dao                       = require('./dao');
const getTaskListTerminalOutput = require('./commands/ls');
const getCalendarTerminalOutput = require('./commands/cal');

const TaskCommand = { util : new Util(), dao: new Dao() };

TaskCommand.run = function() {
  const args = require('minimist')(process.argv.slice(2));
  const subCommand = args._[0];

  switch (subCommand) {
    case 'add':
    case 'a':
      validateAddInput(args);
      /* Determine whether to upload all local tasks to s3 */
      const doS3Upload = argValue(args.upload, args.u);
      this.dao.createTask(createTask(args), doS3Upload);
      break;
    case 'init':
    case 'i':
      validateInitInput(args);
      //TODO: convert args into proper configuration object...
      this.util.initializeApplication(args);
      break;
    case 'list':
    case 'ls':
    case 'l':
      this.dao
        .getTasks(args)
        .then((tasks) => {
          getTaskListTerminalOutput(tasks)
          .then((tasksOutput) => {
            console.log(tasksOutput);
          });
        });
      break;
    case 'update': /* Update task with annotation */
    case 'u':
      this.dao.updateTask(args);
      break;
    case 'delete': /* Delete specific task */
    case 'd':
      this.dao.deleteTask(args);
    case 'clear':
      //TODO: Prompt user for confirmation...
      this.dao.clearTasks();
      break;
    case 'cal': /* Print task calendar to the terminal */
    case 'c':
      this.dao
        .getTasks(args)
        .then((tasks) => {
          taskListOutputPromise = getTaskListTerminalOutput(tasks);
          getCalendarTerminalOutput(tasks).then((calendarOutput) => {
            console.log(`Current time is ${require('moment')().format("ddd, hA")}`);
            console.log(calendarOutput)  /* Print calendar to console first */
            taskListOutputPromise.then((tasksOutput) =>
              console.log(tasksOutput)); /* Print tasks to console after */
          });
        });
      break;
    default:
      console.log("Ueh, you don't know what you want to do..");
  }
}

module.exports = TaskCommand;


/* ======================== Helpers ======================== */

function validateInitInput(args) {
  if (! args.username) {
    throw 'Please supply -username argument';
  }
}

function validateAddInput(args) {
  if ( !args.title && !args.t ) {
    throw 'Please supply --title argument';
  }

  if ( !args.date && !args.d ) {
    throw 'Please supply --due-date argument';
  } else if (! moment(argValue(args.date,args.d)).isValid()) {
    throw 'Please enter a valid -due-date argument.';
  }
}

function createTask(args) {
  return {
    title: argValue(args.title, args.t),
    creationDate: moment().valueOf(), /* Outputs epoch */
    dueDate: getDate(argValue(args.dueDate,args.d)),
    project: argValue(args.project, args.p),
    subtasks: [],
    points:0,
    owner:null,
    subProjects:null,
    isProject:false,
    isActive:false,
    annotations:[]
  }
}

/* Get non-null arg value if it exits. */
function argValue(obj1, obj2) {
  return (obj1) ? obj1 : obj2;
}

/* Get epoch from date string. */
function getDate(date) {
  if (! date ) {
    return;
  }
  return moment(date).valueOf();
}
