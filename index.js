const fs = require('fs');

//TODO: Get $HOME directory via API.

const TASK_FILE = '/home/ec2-user/.task/tasks';
const CONFIG_FILE= '/home/ec2-user/.task/config';

module.exports = () => {
  const minimist = require('minimist')

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
      //TODO: Add list capability.
    case 'update':
      //TODO: Add update capability.
    case 'delete':
      //TODO: Add delete capability.
    default:
      console.log("Ueh, you don't know what you want to do..");
  }

}

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
  var taskFilePromise = fs.promises.readFile(CONFIG_FILE);

  taskFilePromise.then((data) => {
    console.log('Task has been initialized already, nothing to do.');
  }).catch( (err) => { /*Bucket does not exist for saving task data.*/

    const AWS = require('aws-sdk');
    const uuid = require('uuid');

    console.log('Initializing task, creating a new bucket in S3...');

    //Load in credentials...
    //TODO: Get $HOME directory via API.
    AWS.config.loadFromPath('/home/ec2-user/.aws/credentials.json');
    //S3 object must be constructed after config load for creds to be captured.
    const s3 = new AWS.S3({apiVersion: '2006-03-01'});

    const params = {
      Bucket: 'task-bucket' + uuid.v4()
    };

    //Create a bucket in non-specific region.
    s3.createBucket(params, (err, data) => {
      if (err) {
        console.log('Failed to create bucket in S3\n' + err);
      } else {
        console.log('Successfully creatted bucket in S3\n');
        updateConfig({
            bucketLocation : data.Location,
            name : args.username
          });
      }
    });
  });


  /**
   * 1. Read the current task array in from `~/.task/task`.
   * 2. Append the current task to the array.
   * 3. Use lib to upload JSON to S3.
   * 4. Write file from S3 or modified task array to disk at `~/.task/tasks`.
   */
}

/*
 * ============================ Add Task API ============================
 * task add -t <title> -d <due date> ? -p <project_name>
 *
 * Mandatory Parameters:
 * --title,    -t: Short task title.
 * --due-date, -d: Many formats accepted.
 *
 * Optional Parameters:
 * -project, -p: Project name this project belongs to. If the project doesn't exist it
 *  will be created.
 *
*/
function addTask(args) {
  verifyAddInput(args);
  const task = {};
  var createdDate = new Date().getTime();

  task.title = (args.title ? args.title : null);
  task.dueDate = (args.dueDate ? args.dueDate : null);
  task.createdDate = createdDate;

  //TODO: Implement callback for once object has been loaded to S3.
  //Should update the file stored locally.

  /*
   * saveToS3(task).then( (err, res) => {
   *  saveToDisk(task);
   * });
  */
}





/* ============================ Helpers ============================ */

function verifyAddInput(args) {
  if (! args.title) {
    throw 'Please supply --title argument';
  }

  if (! args.date) {
    //TODO: Verify date string. Use moment package to parse the date string.
    throw 'Please supply --due-date argument';
  }
}

function verifyInitInput(args) {
  if (! args.username) {
    throw 'Please supply -username argument';
  }
}

/* Write configuration information to $HOME/config */
function updateConfig(config) {
  const configString = JSON.stringify(config);
  fs.promises
    .appendFile(CONFIG_FILE,configString)
    .then((data) => {
      console.log('Successfully wrote ' + configString + ' to config');
    }).catch((err) => {
      console.log('Error writing data to config\n' + err);
    });
}
