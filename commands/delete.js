/**
 *
 * @author Philip M. Turner
 *
 */


/* task delete */


const Dao = require('../dao');

function DeleteCommand(tasks) {
  this.dao = new Dao();
}

ListCommand.prototype.run = function (args) {

  this.dao.deleteTask(args);

}

module.exports = DeleteCommand;

