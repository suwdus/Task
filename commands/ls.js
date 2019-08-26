/**
 *
 * @author Philip M. Turner
 *
 */


/* task ls|l ? <filter> */


const Util = require('../util');

function ListCommand(appData) {
  this.appData  = appData;
  this.util     = new Util();
}

ListCommand.prototype.run = function (args) {

  //TODO: Base filtering on user input...
  var tasksPromise = this.util.printTasks(this.appData.allTasks, null);
  tasksPromise.then((tasksOutput) => {
    console.log(tasksOutput);
  });

}

module.exports = ListCommand;
