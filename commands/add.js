/**
 *
 * @author Philip M. Turner
 *
 */


/* task add|a */

const moment  = require('moment-timezone');

function AddCommand(appData) {
  this.appData  = appData;
  this.dao      = require('../dao/');
}

AddCommand.prototype.run = function (args) {

  validateAddInput(args);
  const doS3Upload = argValue(args.upload, args.u);

  this.dao.createTask(createTask(args), doS3Upload);
}

function validateAddInput(args) {
  if ( !args.title && !args.t ) {
    throw 'Please supply --title argument';
  }

  if ( !args.date && !args.d ) {
    throw 'Please supply --due-date argument';
  } else if (! moment(argValue(args.date,args.d)).isValid()) {
    throw 'Please enter a valid -due-date argument.';
  }
}

function createTask(args) {
  const title           = argValue(args.title, args.t);
  const creationDate    = moment();
  const completionDate  = null;
  const dueDate         = moment(argValue(args.dueDate,args.d));
  const project         = argValue(args.project, args.p);
  const parentTaskId    = argValue(args.parentTaskId, args.P);
  const subtasks        = [];
  const points          = 0;
  const owner           = (args.owner) ? args.owner : config.name;
  const annotations     = [];
  const isProject       = (project) ? true : false;
  const isActive        = (args.active) ? true : false;

  return {
    title: title,
    creationDate: creationDate,
    dueDate: dueDate,
    completionDate: completionDate,
    parentTaskId : parentTaskId,
    project: project,
    subtasks: subtasks,
    points: points,
    owner: owner,
    annotations: annotations,
    isProject: isProject,
    isActive: isActive
  }
}

function argValue(obj1, obj2) {
  return (obj1) ? obj1 : obj2;
}

module.exports = AddCommand;
