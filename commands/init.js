/**
 *
 * @author Philip M. Turner
 *
 */


/* task init */


const S3Util = require('../utils/s3-util');

/* Note: appData and config will be undefined for this command */

function InitCommand(appData) {
  this.s3Util = new S3Util();
}

InitCommand.prototype.run = function (args) {

  validateInitInput(args);
  this.s3Util.initializeApplication(createConfig(args));

}

function validateInitInput(args) {
  if ( !args.username && !args.u ) {
    throw 'Please supply --username argument';
  }

  if ( !args.timezone && !args.z ) {
    throw 'Please supply --timezone argument';
  }
}

function createConfig(args) {
  return {
    name: argValue(args.username, args.u),
    timezone: argValue(args.timezone, args.z)
  }
}

function argValue(obj1, obj2) {
  return (obj1) ? obj1 : obj2;
}
