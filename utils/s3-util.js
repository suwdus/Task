/**
 *
 * Description: Handles app configuration, uploading/retrieving
 * to dependent services.
 *
 *
 * @author Philip M. Turner
 *
 */
const Dao = require('../dao/dao');

function S3Util() {
  this.dao = new Dao();
}

S3Util.prototype.initializeApplication = function(configValues) {
  var taskFilePromise = require('fs').promises.access(APP_CONFIG_PATH);

  taskFilePromise.then((data) => {
    console.log('Task has been initialized already, nothing to do.');
  }).catch( (err) => { /*Bucket does not exist for saving task data.*/
    createBucketAndUpdateConfig(configValues);
  });
}

S3Util.prototype.uploadData = function() {
  const AWS             = require('aws-sdk');
  const uuid            = require('uuid');
  const credentialsFile = `${process.env.HOME}/.aws/credentials.json`;

  console.log('Uploading data to S3...');

  try {
    require(credentialsFile);
  } catch(err) { throw `Please specify aws credentials in ${credentialsFile}` };

  AWS.config.loadFromPath(credentialsFile);
  //S3 object must be constructed after config load for creds to be captured.
  const s3 = new AWS.S3({apiVersion: '2006-03-01'});

  const params = {
    Bucket: getS3BucketString(config.bucketLocation),
    Body: JSON.stringify(this.dao.getAppData()),
    Key: require('path').basename(config.taskFile)
  };

  s3.putObject(params, function(err, data) {
    if (err) {
      console.log('Could not put object in bucket',err);
    } else
      console.log('Successfully put object in S3');
  });
}

function createBucketAndUpdateConfig(config) {
  const AWS             = require('aws-sdk');
  const uuid            = require('uuid');
  const credentialsFile = `${process.env.HOME}/.aws/credentials.json`;
  const taskFile        = `${process.env.HOME}/.task/tasks.json`;

  console.log('Initializing task, creating a new bucket in S3...');

  try {
    require(credentialsFile);
  } catch(err) { throw `Please specify aws credentials in ${credentialsFile}` };

  AWS.config.loadFromPath(credentialsFile);
  //S3 object must be constructed after config load for creds to be captured.
  const s3 = new AWS.S3({apiVersion: '2006-03-01'});

  const params = {
    Bucket: 'taskbucket' + uuid.v4()
  };

  //Create a bucket in nonspecific region.
  s3.createBucket(params, (err, data) => {
    if (err) {
      console.log('Failed to create bucket in S3', err);
    } else {
      console.log('Successfully created bucket in S3');
      updateConfig({
        configFile: APP_CONFIG_PATH,
        taskFile: taskFile,
        bucketLocation : data.Location,
        name : config.name,
        timezone: config.timezone
      });
    }
  });
}

/* Write configuration information to file */
function updateConfig(config) {
  const configString = JSON.stringify(config);
  const path         = require('path');
  const fs           = require('fs').promises;


  this.writeFile = function() {
    fs.writeFile(config.configFile, configString)
    .then(() => {
      console.log('Successfully wrote configuration information to config file');
      this.dao.clearTasks();
    }).catch((err) => console.log('Error writing configuration information to config file', err));
  }

  fs.access(path.dirname(config.configFile))
  .then( ()=> {       /* ~/.task Directory exists        */
    this.writeFile();
  }).catch((err) => { /* ~/.task Directory does not exist */
    fs.mkdir(path.dirname(config.configFile))
    .then(() => this.writeFile())
    .catch((err) => console.log('Could not create application directory', err));
  });
}

function getS3BucketString(bucketStr) {
  return bucketStr
          .replace('http://','')
          .replace(/.s3.*/,'');
}

module.exports = S3Util;
