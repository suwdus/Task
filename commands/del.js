/**
 *
 * @author Philip M. Turner
 *
 */


/* task delete */


function DeleteCommand(appData) {
  this.appData = appData;
  this.dao = require('../dao/');
}

DeleteCommand.prototype.run = function (args) {
  const tasksToDelete = process.argv.slice(3);
  this.dao.deleteTasks(tasksToDelete);
}

module.exports = DeleteCommand;
