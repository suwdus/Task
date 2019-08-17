const fs = require('fs');
const minimist = require('minimist')
const CONFIG_FILE= '/home/ec2-user/.task/config';

var TaskCommand = require('./util');

TaskCommand.run = function() {
  const args = minimist(process.argv.slice(2))
  const subCommand = args._[0];

  switch (subCommand) {
    case 'add':
      addTask(args);
      break;
    case 'init':
      init(args);
      break;
    case 'list':
      listTasks(args);
    case 'update':
      updateTask(args);
    case 'delete':
      deleteTask(args);
    default:
      console.log("Ueh, you don't know what you want to do..");
  }
}

module.exports = TaskCommand.run;

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
function init(args) {
  verifyInitInput(args);
  var taskFilePromise = fs.promises.access(CONFIG_FILE);

  taskFilePromise.then((data) => {
    console.log('Task has been initialized already, nothing to do.');
  }).catch( (err) => { /*Bucket does not exist for saving task data.*/
    createBucket();
  });
}

/* ============================ Helpers ============================ */

function verifyInitInput(args) {
  if (! args.username) {
    throw 'Please supply -username argument';
  }
}

