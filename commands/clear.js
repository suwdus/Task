/**
 *
 * @author Philip M. Turner
 *
 */


/* task clear */

function ClearCommand(appData) {
  this.dao = require('../dao/');
}

ClearCommand.prototype.run = function(args) {
  this.dao.clearTasks();
}

module.exports = ClearCommand;

