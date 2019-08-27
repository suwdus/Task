/**
 *
 * @author Philip M. Turner
 *
 */


/* task delete */


const Dao = require('../dao/dao');

function DeleteCommand(appData) {
  this.appData = appData;
  this.dao = new Dao();
}

DeleteCommand.prototype.run = function (args) {

  this.dao.deleteTask(process.argv[3]);

}

module.exports = DeleteCommand;
