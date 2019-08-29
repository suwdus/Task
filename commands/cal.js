/**
 *
 * @author Philip M. Turner
 *
 */

const PrintUtil    = require('../utils/print-util');
const CalendarUtil = require('../utils/calendar-util');

function CalendarCommand(appData) {
  this.appData      = appData;
  this.printUtil    = new PrintUtil();
  this.calendarUtil = new CalendarUtil();
}

/* Returns a Promise containing the task calendar string. */
CalendarCommand.prototype.run = function () {
  const moment = require('moment-timezone');

  var taskListOutputPromise = this.printUtil.printTasks(this.appData.allTasks);
  var calendarOutputPromise = this.calendarUtil.getCalendarView();

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
