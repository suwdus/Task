const fs = require('fs');
const minimist = require('minimist')
const TASK_FILE = '/home/ec2-user/.task/tasks';
const CONFIG_FILE= '/home/ec2-user/.task/config';
//TODO: Get $HOME directory via API.

function Util() {
}

Util.prototype.addTask = function(taskInput, doS3Upload) {

  if (doS3Upload) {
    //TODO: Implement...
  }

  this.getTasks()
    .then((tasks) => {

      tasks.push(taskInput);
      const taskJSON = JSON.stringify(tasks);

      fs.promises
        .writeFile(TASK_FILE,taskJSON)
        .then((data) => {
          console.log('Successfully wrote data to task file\n' + taskJSON);
        }).catch((err) => {
          console.log('Error writing data to task file\n' + err);
        });
    });
}

Util.prototype.initializeApplication = function(configValues) {
  var taskFilePromise = fs.promises.access(CONFIG_FILE);

  taskFilePromise.then((data) => {
    console.log('Task has been initialized already, nothing to do.');
  }).catch( (err) => { /*Bucket does not exist for saving task data.*/
    this.createBucketAndUpdateConfig(configValues);
  });
  //TODO: Append keys from config object to config file...
}

/* Returns a Promise containing task array. */
Util.prototype.getTasks = function() {
  return fs.promises
    .readFile(TASK_FILE)
    .then((dataString) => {
      return JSON.parse(dataString);
    }).catch((err) => {
      console.log('Error reading data from task file\n' + err);
    });
}

Util.prototype.updateTask = function() {
  //TODO: Implement...
}

Util.prototype.deleteTask = function() {
  //TODO: Implement...
}

Util.prototype.createBucketAndUpdateConfig = function(config) {
  const AWS   = require('aws-sdk');
  const uuid  = require('uuid');

  console.log('Initializing task, creating a new bucket in S3...');

  //Load in credentials...
  //TODO: Get $HOME directory via API.
  AWS.config.loadFromPath('/home/ec2-user/.aws/credentials.json');
  //S3 object must be constructed after config load for creds to be captured.
  const s3 = new AWS.S3({apiVersion: '2006-03-01'});

  const params = {
    Bucket: 'taskbucket' + uuid.v4()
  };

  //Create a bucket in nonspecific region.
  s3.createBucket(params, (err, data) => {
    if (err) {
      console.log('Failed to create bucket in S3\n' + err);
    } else {
      console.log('Successfully created bucket in S3\n');
      /*Note: More keys will be iteratively added from config. */
      this.updateConfig({
          bucketLocation : data.Location,
          name : config.username
        });
    }
  });
}

/* Write configuration information to $HOME/config */
Util.prototype.updateConfig = function(config) {
  const configString = JSON.stringify(config);
  fs.promises
    .appendFile(CONFIG_FILE,configString)
    .then((data) => {
      console.log('Successfully wrote ' + configString + ' to config');
    }).catch((err) => {
      console.log('Error writing data to config\n' + err);
    });
}

module.exports = Util;
