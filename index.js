const fs = require('fs');
const CONFIG_FILE= '/home/ec2-user/.task/config';
const Util = require('./util');

const TaskCommand = { util : new Util() };

TaskCommand.run = function() {
  const args = require('minimist')(process.argv.slice(2));
  const subCommand = args._[0];

  switch (subCommand) {
    case 'add':
      verifyAddInput(args);
      /*Determine whether to upload all local tasks to s3*/
      const doS3Upload = argValue(args.upload, args.u);

      this.util.addTask(createTask(args), doS3Upload);
      break;
    case 'init':
      verifyInitInput(args);
      //TODO: convert args into proper configuration object...
      this.util.initializeApplication(args);
      break;
    case 'list':
      this.util.listTasks(args);
    case 'update':
      this.util.updateTask(args);
    case 'delete':
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

function verifyInitInput(args) {
  if (! args.username) {
    throw 'Please supply -username argument';
  }
}
function verifyAddInput(args) {
  if ( !args.title && !args.t ) {
    console.log(args);
    throw 'Please supply --title argument';
  }

  if ( !args.date && !args.d ) {
    //TODO: Verify date string. Use moment package to parse the date string.
    throw 'Please supply --due-date argument';
  }
}

function createTask(args) {
  return {
    title: argValue(args.title, args.t),
    //TODO: Use moment package...
    creationDate: '2019',
    dueDate: getDate(argValue(args.dueDate,args.d))
  }
}

function argValue(obj1, obj2) {
  return (obj1) ? obj1 : obj2;
}

//TODO: Implement...
function getDate(date) {
  return '2019';
}
