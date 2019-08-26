/**
 *
 * @author Philip M. Turner
 *
 */


/* task update */


const Dao = require('../dao');

function UpdateCommand(tasks) {
  this.dao = new Dao();
}

ListCommand.prototype.run = function (args) {

  this.dao.updateTask(args);

}

module.exports = UpdateCommand;
