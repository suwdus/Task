const minimist = require('minimist')
//TODO: Get $HOME directory via API.

const Dao                       = require('./dao');

function Util() {
  global.APP_CONFIG_PATH = require('./config').configPath();
}

Util.prototype.dao = new Dao();

Util.prototype.initializeApplication = function(configValues) {
  var taskFilePromise = require('fs').promises.access(APP_CONFIG_PATH);

  taskFilePromise.then((data) => {
    console.log('Task has been initialized already, nothing to do.');
  }).catch( (err) => { /*Bucket does not exist for saving task data.*/
    this.createBucketAndUpdateConfig(configValues); //TODO: Split.
  });
  //TODO: Append keys from config object to config file...
}


Util.prototype.createBucketAndUpdateConfig = function(config) {
  const AWS             = require('aws-sdk');
  const uuid            = require('uuid');
  const credentialsFile = `${process.env.HOME}/.aws/credentials.json`;
  const taskFile        = `${process.env.HOME}/.task/tasks.json`;

  console.log('Initializing task, creating a new bucket in S3...');

  try {
    require(credentialsFile); /* TODO: Prompt for access/secret access keys and create the file */
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
      //Note: More keys will be iteratively added from config.
      this.updateConfig({
          configFile: APP_CONFIG_PATH,
          taskFile: taskFile,
          bucketLocation : data.Location,
          name : config.username,
          timezone: 'America/Los_Angeles'
        });
    }
  });

}

/* Write configuration information to file */
Util.prototype.updateConfig = function(config) {
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


module.exports = Util;
