const fs = require('fs');
const minimist = require('minimist')
const TASK_FILE = '/home/ec2-user/.task/tasks';
const CONFIG_FILE= '/home/ec2-user/.task/config';

//TODO: Get $HOME directory via API.

var Util = {
  addTask: function(task) {

    verifyAddInput(args);

    const doS3Upload = (args.upload || args.u) ? true : false;

    //Set date task was created to now...
    var createdDate = new Date().getTime();
    task.title = (args.title ? args.title : null);
    task.dueDate = (args.dueDate ? args.dueDate : null);
    task.createdDate = createdDate;

    if (doS3Upload) {
      //TODO: Implement...
    }
  },
  listTasks : function() {
    //TODO: Implement...
  },
  updateTask: function() {
    //TODO: Implement...
  },
  deleteTask: function() {
    //TODO: Implement...
  },
  createBucket: function() {
    const AWS = require('awssdk');
    const uuid = require('uuid');

    console.log('Initializing task, creating a new bucket in S3...');

    //Load in credentials...
    //TODO: Get $HOME directory via API.
    AWS.config.loadFromPath('/home/ec2user/.aws/credentials.json');
    //S3 object must be constructed after config load for creds to be captured.
    const s3 = new AWS.S3({apiVersion: '20060301'});

    const params = {
      Bucket: 'taskbucket' + uuid.v4()
    };

    //Create a bucket in nonspecific region.
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
  }
}

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
