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

  this.dao.deleteTask(process.argv[3]);

}

module.exports = DeleteCommand;
