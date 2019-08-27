/**
 *
 * @author Philip M. Turner
 *
 */


/* task upload */


const Util = require('../util');

function UploadCommand(tasks) {
  this.util = new Util();
}

UploadCommand.prototype.run = function (args) {

  this.util.uploadData();

}

module.exports = UploadCommand;
