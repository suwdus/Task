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
    creationDate: require('moment')().unix(), /* Outputs epoch */
    dueDate: getDate(argValue(args.dueDate,args.d))
  }
}

function argValue(obj1, obj2) {
  return (obj1) ? obj1 : obj2;
}

/* Get date */
function getDate(date) {
  if (! date ) { /* Check if date argument was passed. */
    throw 'Validation Error: Date is required.';
  } else if(! moment(date).isValid() ) {
    throw 'Validation Error: Date is invalid.';
  }
  return moment(date).unix();
}

function printTasks(tasksPromise) {
  tasksPromise.then((tasks) => {
    tasks.forEach( (task) => {
      console.log(`${task.title} ${task.dueDate} ${task.creationDate}`);
    });
  });
}
