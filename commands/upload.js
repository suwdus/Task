/**
 *
 * @author Philip M. Turner
 *
 */


/* task upload */


const S3Util = require('../utils/s3-util');

function UploadCommand(tasks) {
  this.s3Util = new S3Util();
}

UploadCommand.prototype.run = function (args) {

  this.s3Util.uploadData();

}

module.exports = UploadCommand;
