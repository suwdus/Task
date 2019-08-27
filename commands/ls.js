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

  if (process.argv[3]){ /* Indicator to print specific task */
    const taskId = process.argv[3];
    printTask(this.appData.allTasks, taskId);
    return;
  }

  //Prints all tasks.
  var tasksPromise = this.util.printTasks(this.appData.allTasks, null);
  tasksPromise.then((tasksOutput) => {
    console.log(tasksOutput);
  });

}

function printTask(tasks, taskId) {
    const {table}               = require('table');
    const getBorderCharacters   = require('table').getBorderCharacters;
    const chalk                 = require('chalk');

    const task        = tasks[taskId];
    const pointsLeft  = task.points;
    var data = [];

    //Add header...
    data.push([
      'Title',
      'Project',
      'Due Date',
      'Points',
      'Owner'
    ]);

    data.push([
      task.title,
      `${task.project}(${task.parentProjectId})\n`,
      task.dueDate,
      task.points,
      task.owner
      ]); //TODO

    var output = table(data, {
      border: getBorderCharacters(`void`),
      columnDefault: {
          paddingLeft: 0,
          paddingRight: 2
      },
      drawHorizontalLine: () => {
          return false;
      }
    });

  var annoationSection = '';
  task.annotations.forEach((annotation) => {
    annoationSection += `Date: ${annotation.date}\n`
                      + `Comment: ${annotation.comment}\n`
                      + `Point Update: ${annotation.pointUpdate}\n`
                      + `Updated By: ${annotation.updatedBy}\n\n`;
  });
  console.log(`${output}\n${annoationSection}`);
}

module.exports = ListCommand;
