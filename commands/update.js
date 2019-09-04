/**
 *
 * @author Philip M. Turner
 *
 */


/* task update 3 'We struck gold today' */


function UpdateCommand(appData) {
  this.appData  = appData;
  this.dao      = require('../dao/');
}

UpdateCommand.prototype.run = function (args) {

  const taskId      = process.argv[3];
  const comment     = process.argv[4];
  const pointUpdate = Number(process.argv[5]);

  //TODO: Short circuit for point update.

  var task = this.appData.allTasks[taskId];

  /* Make task modifications */
  task.points += pointUpdate;

  task.annotations.push(createAnnotation(comment, pointUpdate, task.points));

  this.dao.updateTask(task);
}

function createAnnotation(comment, pointUpdate, pointsLeft) {
  return {
    comment: comment,
    date: require('moment-timezone')().tz(config.timezone),
    pointUpdate: getPointUpdateString(pointUpdate),
    updatedBy: config.name
  }
}

function getPointUpdateString(pointUpdate, pointsLeft) {
  if (pointUpdate === 0)
    return `Points remaining unchanged, ${pointsLeft} points left.`;
  else if (pointUpdate > 0)
    return `Added ${pointUpdate} point(s) to task.`;
  else
    return `Subtracted ${-pointUpdate} point(s) to task`;
}

module.exports = UpdateCommand;
