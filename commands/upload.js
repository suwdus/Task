/**
 *
 * @author Philip M. Turner
 *
 */


/* task upload */


function UploadCommand(tasks) {
  this.s3Util = require('../utils/s3-util');
}

UploadCommand.prototype.run = function (args) {

  this.s3Util.uploadData();

}

module.exports = UploadCommand;
