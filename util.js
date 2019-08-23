const minimist = require('minimist')
//TODO: Get $HOME directory via API.

function Util() {
}

Util.prototype.initializeApplication = function(configValues) {
  var taskFilePromise = fs.promises.access(CONFIG_FILE);

  taskFilePromise.then((data) => {
    console.log('Task has been initialized already, nothing to do.');
  }).catch( (err) => { /*Bucket does not exist for saving task data.*/
    this.createBucketAndUpdateConfig(configValues); //TODO: Split.
  });
  //TODO: Append keys from config object to config file...
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
  require('fs').promises
    .appendFile(CONFIG_FILE,configString)
    .then((data) => {
      console.log('Successfully wrote ' + configString + ' to config');
    }).catch((err) => {
      console.log('Error writing data to config\n' + err);
    });
}


module.exports = Util;
