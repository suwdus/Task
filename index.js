const fs = require('fs');
const moment = require('moment');
const CONFIG_FILE= '/home/ec2-user/.task/config';
const Util = require('./util');

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
      const tasksPromise = this.util.getTasks(args);
      printTasks(tasksPromise);
      break;
    case 'update':
    case 'u':
      this.util.updateTask(args);
      break;
    case 'delete':
    case 'd':
      this.util.deleteTask(args);
    case 'clear':
    case 'c':
      this.util.clearTasks();
      break;
    default:
      console.log("Ueh, you don't know what you want to do..");
  }
}

module.exports = TaskCommand;

/*
 * ============================ Add Task API ============================
 * task add -t <title> -d <due date> ? -p <project_name> -u
 *
 * Mandatory Parameters:
 * --title,    -t: Short task title.
 * --due-date, -d: Many formats accepted.
 *
 * Optional Parameters:
 * --project, -p: Project name this project belongs to. If the project doesn't exist it
 * --upload, -u : If present, upload this and all local tasks to S3.
 *  will be created.
 *
*/

/*
 * =========================== Init Task API ===========================
 * Initializes `task` by creating an S3 bucket to store task information.
 *
 * Usage: task init -username <name> ? -region <region>
 *
 * Mandatory Parameters:
 * --username, -u: User's first and last name.
 *
 * Optional Parameters:
 * --region,   -r: Region to use for bucket.
*/


/* ============================ Helpers ============================ */

function validateInitInput(args) {
  if (! args.username) {
    throw 'Please supply -username argument';
  }
}
function validateAddInput(args) {
  if ( !args.title && !args.t ) {
    console.log(args);
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
    creationDate: moment().unix(), /* Outputs epoch */
    dueDate: getDate(argValue(args.dueDate,args.d))
  }
}

function argValue(obj1, obj2) {
  return (obj1) ? obj1 : obj2;
}

/* Get date */
function getDate(date) {
  if (! date ) {
    return;
  }
  return moment(date).unix();
}

/* Constants used for printing out the task l output */

const AGE_COLUMN_STRING         = 'Age';
const ID_COLUMN_STRING          = 'ID';
const PROJECT_COLUMN_STRING     = 'Project';
const URGENCY_COLUMN_STRING     = 'Urg';
const DESCRIPTION_COLUMN_STRING = 'Description';

const SHORT_TEXT_LENGTH_RESTRICTION   = 3;
const MEDIUM_TEXT_LENGTH_RESTRICTION  = 15;
const LONG_TEXT_LENGTH_RESTRICTION    = 25;

const columns = [
    { colKey: ID_COLUMN_STRING,
      lengthRestriction: SHORT_TEXT_LENGTH_RESTRICTION
    },
    { colKey: AGE_COLUMN_STRING,
      lengthRestriction: SHORT_TEXT_LENGTH_RESTRICTION
    },
    { colKey: PROJECT_COLUMN_STRING,
      lengthRestriction: MEDIUM_TEXT_LENGTH_RESTRICTION
    },
    { colKey: DESCRIPTION_COLUMN_STRING,
      lengthRestriction: LONG_TEXT_LENGTH_RESTRICTION
    },
    { colKey: URGENCY_COLUMN_STRING,
      lengthRestriction: SHORT_TEXT_LENGTH_RESTRICTION
    }
];

function getColVal(colKey, task) {
  switch (colKey) {
    case ID_COLUMN_STRING:
      return '6d';            /* TODO: */
    case AGE_COLUMN_STRING:
      return '1';             /* TODO: */
    case PROJECT_COLUMN_STRING:
      return 'Cool Project';  /* TODO: */
    case URGENCY_COLUMN_STRING:
      return '.05';           /* TODO: */
    case DESCRIPTION_COLUMN_STRING:
      return task.title;
  }
}

function printTasks(tasksPromise) {

  const chalk = require('chalk');
  var header  = '';

  //Create task table header...
  columns.forEach((col) => {
    header += `${chalk.underline(col.colKey.padEnd(col.lengthRestriction))} `;
  });

  tasksPromise.then((tasks) => {
    if (tasks.length > 0)
      console.log(header);

    tasks.forEach( (task) => {
      var taskStr = '';

      columns.forEach((column) => {
        //Construct task string...
        taskStr += `${getColVal(column.colKey, task).padEnd(column.lengthRestriction)} `;
      });

      //Print the task...
      console.log(taskStr);
    });
    console.log(`\n${tasks.length} tasks`);
  });
}
