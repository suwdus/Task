/**
 *
 * Description: Handles app configuration, uploading/retrieving
 * to dependent services.
 *
 *
 * @author Philip M. Turner
 *
 */
const minimist  = require('minimist')
const Dao       = require('./dao');

function Util() {
}

Util.prototype.dao = new Dao();

Util.prototype.initializeApplication = function(configValues) {
  var taskFilePromise = require('fs').promises.access(APP_CONFIG_PATH);

  taskFilePromise.then((data) => {
    console.log('Task has been initialized already, nothing to do.');
  }).catch( (err) => { /*Bucket does not exist for saving task data.*/
    createBucketAndUpdateConfig(configValues);
  });
}

Util.prototype.uploadData = function() {
  const AWS             = require('aws-sdk');
  const uuid            = require('uuid');
  const credentialsFile = `${process.env.HOME}/.aws/credentials.json`;
  const taskFile        = `${process.env.HOME}/.task/tasks.json`;

  console.log('Uploading data to S3...');

  try {
    require(credentialsFile);
  } catch(err) { throw `Please specify aws credentials in ${credentialsFile}` };

  AWS.config.loadFromPath(credentialsFile);
  //S3 object must be constructed after config load for creds to be captured.
  const s3 = new AWS.S3({apiVersion: '2006-03-01'});

  const params = {
    Bucket: getS3BucketString(config.bucketLocation),
    Body: JSON.stringify(require(config.taskFile)),
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

const AGE_COLUMN_LABEL         = 'Age';
const ID_COLUMN_LABEL          = 'ID';
const PROJECT_COLUMN_LABEL     = 'Project';
const URGENCY_COLUMN_LABEL     = 'Urg';
const DESCRIPTION_COLUMN_LABEL = 'Description';
const OWNER_COLUMN_LABEL       = 'Owner';
const DUE_DATE_COLUMN_LABEL    = 'Due Date';

Util.prototype.printTasks = function (tasks, filters) {

  return new Promise( (resolve,reject) => {
    var taskList = Object.values(tasks); //TODO: Base filtering on user input...
    if (taskList.length === 0) /* Only construct output if tasks are present */
      resolve(`0 tasks`);

    const {table}               = require('table');
    const getBorderCharacters   = require('table').getBorderCharacters;
    const chalk                 = require('chalk');

    var data = [];

    //Add header...
    data.push([
      chalk.underline(ID_COLUMN_LABEL),
      chalk.underline(AGE_COLUMN_LABEL),
      chalk.underline(PROJECT_COLUMN_LABEL),
      chalk.underline(DESCRIPTION_COLUMN_LABEL),
      chalk.underline(DUE_DATE_COLUMN_LABEL),
      chalk.underline(OWNER_COLUMN_LABEL),
      chalk.underline(URGENCY_COLUMN_LABEL)
    ]);

    taskList.forEach((task) => {
      data.push([
        task.id,
        getAgeString(task.creationDate),
        getProjectString(tasks, task),
        task.title,
        chalk.italic(getDateString(task.dueDate)),
        task.owner,
        '0.5']) //TODO
    });

    var output = table(data, {
      border: getBorderCharacters(`void`),
      columnDefault: {
          paddingLeft: 0,
          paddingRight: 1
      },
      drawHorizontalLine: () => {
          return false;
      }
    });

    output += `\n(${taskList.length} task${ (taskList.length) === 1 ? '':'s'})\n`; /* i.e. Prints (1 task). */

    resolve(output);
  });

}

/* Get non-null arg value if it exits. */
Util.prototype.argValue = function(obj1, obj2) {
  return (obj1) ? obj1 : obj2;
}
/* ======================== Helpers ======================== */

function getDateString(date) {
  var moment      = require('moment-timezone');
  const timezone  = config.timezone;

  return moment(date).tz(timezone).format("dddd, MMMM Do YYYY");
}

function getAgeString(date) {
  var moment = require('moment');
  var thing = moment(date).diff(moment(), 'days');
  return thing.toString();
}

function getProjectString(tasks, task) {
  if (task.project)
    return `${task.project}(id:${task.id})`;
  else if(tasks[task.parentTaskId])
    return `${tasks[task.parentTaskId].project}(id:${tasks[task.parentTaskId].id})`;
  else
    return '/';
}

function getS3BucketString(bucketStr) {
  return bucketStr
          .replace('http://','')
          .replace(/.s3.*/,'');
}
module.exports = Util;
