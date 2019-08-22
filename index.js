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

const moment      = require('moment');
const Util        = require('./util');
const printTasks  = require('./commands/ls');
const printCal    = require('./commands/cal');

const TaskCommand = { util : new Util() };

TaskCommand.run = function() {
  const args = require('minimist')(process.argv.slice(2));
  const subCommand = args._[0];

  switch (subCommand) {
    case 'add':
    case 'a':
      validateAddInput(args);
      /* Determine whether to upload all local tasks to s3 */
      const doS3Upload = argValue(args.upload, args.u);
      this.util.addTask(createTask(args), doS3Upload);
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
      this.util
        .getTasks(args)
        .then((tasks) => printTasks(tasks));
      break;
    case 'update': /* Update task with annotation */
    case 'u':
      this.util.updateTask(args);
      break;
    case 'delete': /* Delete specific task */
    case 'd':
      this.util.deleteTask(args);
    case 'clear':
      //TODO: Prompt user for confirmation...
      this.util.clearTasks();
      break;
    case 'cal': /* Print task calendar to the terminal */
    case 'c':
      this.util
        .getTasks(args)
        .then((tasks) => {
          printCal(tasks);
          printTasks(tasks);
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
    //TODO: Verify date string. Use moment package to parse the date string.
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
    project: argValue(args.project, args.p)
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
