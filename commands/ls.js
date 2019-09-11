/**
 *
 * @author Philip M. Turner
 *
 */


/* task ls|l ? <filter> */


function ListCommand(appData) {
  this.appData    = appData;
  this.printUtil  = require('../utils/print-util');
}

ListCommand.prototype.run = function (args) {

  if (process.argv[3]){ /* Indicator to print specific task */
    const taskId = process.argv[3];
    this.printUtil.printTask(this.appData.tasks[taskId]);
    return;
  }

  //Prints all tasks.
  var tasksPromise = this.printUtil.printTasks(this.appData.tasks, null);
  tasksPromise.then((tasksOutput) => {
    console.log(tasksOutput);
  });

}

module.exports = ListCommand;
