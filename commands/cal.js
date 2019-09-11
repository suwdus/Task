/**
 *
 * @author Philip M. Turner
 *
 */

function CalendarCommand(appData) {
  this.appData      = appData;
  this.printUtil    = require('../utils/print-util');
  this.calendarUtil = require('../utils/calendar-util');
}

/* Returns a Promise containing the task calendar string. */
CalendarCommand.prototype.run = function () {
  const moment = require('moment-timezone');

  var taskListOutputPromise = this.printUtil.printTasks(this.appData.tasks);
  var calendarOutputPromise = this.calendarUtil.getCalendarView(require('../dao').getAllTasks());

  calendarOutputPromise
  .then((calendarOutput) => {
    taskListOutputPromise.then((taskList) => {
      var out = `Currently in Q${moment().quarter()} ` + `${moment().year().toString()}\n\n` +
                `${moment().tz(config.timezone).format("ddd, hA")}\n` +
                `${calendarOutput}\n` +
                `${taskList}`;
      console.log(out);
    });
  });
}

module.exports = CalendarCommand;
