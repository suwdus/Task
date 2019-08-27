/**
 *
 * @author Philip M. Turner
 *
 */

const Util = require('../util');

function CalendarCommand(appData) {
  this.appData  = appData;
  this.util     = new Util();
}

/* Returns a Promise containing the task calendar string. */
CalendarCommand.prototype.run = function () {
  const moment = require('moment-timezone');

  var taskListOutputPromise = this.util.printTasks(this.appData.allTasks);

  var calendarOutputPromise = new Promise( (resolve, reject) => {
    var allTasks = Object.values(this.appData.allTasks);
    const childProcess  = require('child_process');

    var thisCal, prevCal, nextCal;

    var events                = require('events');
    var eventEmitter          = new events.EventEmitter();
    var childProcessDoneCount = 0;

    //Assemble calendar string and add date highlighting once all calenders have returned...
    eventEmitter.on('retrievedCal', () => {
      childProcessDoneCount++;

      if (childProcessDoneCount === 3) {
        resolve( /* Return formatted 3-Calendar display */
          buildCalendarOutput(
            allTasks,
            prevCal,
            thisCal,
            nextCal)
        );
      }
    });

    //Use default os `cal` program to build calendar strings...
    const now                     = new Date();
    const CUR_MONTH_NUM           = now.getMonth()+1; //date month indexed from 0.
    const CUR_YEAR_NUM            = now.getYear();

    //TODO: Make calendar months shown configurable.
    const prevCalChildProcess     = childProcess.spawn('cal', [CUR_MONTH_NUM-1,'2019']);
    const currentCalChildProcess  = childProcess.spawn('cal');
    const nextCalChildProcess     = childProcess.spawn('cal',[CUR_MONTH_NUM+1,'2019']);

    prevCalChildProcess.stdout.on('data', (calendar) => {
      prevCal = {
        month:CUR_MONTH_NUM -1,
        calendarString: calendar.toString()
      };
      eventEmitter.emit('retrievedCal');
    });

    currentCalChildProcess.stdout.on('data', (calendar) => {
      eventEmitter.emit('retrievedCal');
      thisCal = {
        month: CUR_MONTH_NUM,
        calendarString: calendar.toString()
      };
    });


    nextCalChildProcess.stdout.on('data', (calendar) => {
      nextCal = {
        month: CUR_MONTH_NUM+1,
        calendarString: calendar.toString()
      };
      eventEmitter.emit('retrievedCal');
    });
  });

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

/* ======================== Helpers ======================== */

function buildCalendarOutput(tasks, cal1, cal2, cal3) {
  const chalk  = require('chalk');

  const legend = `Legend: ` +
                ` ${chalk.blue('today')},` +
                ` ${chalk.red('due')}, `+
                ` ${chalk.yellow('due-today')},`+
                ` ${chalk.bold('overdue')},`+
                ` weekend,`+
                ` ${chalk.green('holiday')},`+
                ` ${chalk.underline('weeknumber')}.`

  var calendarString = '';

   /* Highlight calendar dates according to tasks and split on `\n` */
  const splitCal1 = highlight(tasks, cal1).split('\n');
  const splitCal2 = highlight(tasks, cal2).split('\n');
  const splitCal3 = highlight(tasks, cal3).split('\n');

  /* Combine calendars, force 20 character calendar width per calendar. */
  var calendarAll = ''; const len = splitCal1.length;
  for (var j = 0; j < len; j++)
    calendarAll += `\n${splitCal1[j].padEnd(20)}  ${splitCal2[j].padEnd(20)}  ${splitCal3[j].padEnd(20)}`;
  calendarAll += `\n${legend}\n`;

  return calendarAll;
}

function highlight(tasks, cal) {
  var calendarString  = cal.calendarString; //Will transform calendar string...

  //Remove month header in first line of calendar...
  var idx         = calendarString.match('\n').index;
  var headerStr   = calendarString.slice(0, idx+1)
  calendarString  = calendarString.slice(idx+1, calendarString.length);
  var moment      = require('moment-timezone');
  const now       = moment().tz(config.timezone);

  tasks.forEach((task) => {
    if (task.dueDate) {
      const dueDate       = moment(task.dueDate).tz(config.timezone);
      const dueDateMonth  = dueDate.month()+1;

      calendarString = (cal.month === dueDateMonth) ?
        highlightTaskDueDate(calendarString, dueDate) : calendarString;
    }
  });

  //Add the month header back to the calendar string...
  calendarString = headerStr + calendarString;

  //Apply additional transformations...

  calendarString = (cal.month === now.month()+1) ? highlightToday(calendarString, now) : calendarString;

  //TODO:Print current, due soon tasks to the console.

  return calendarString;
}

function highlightToday(calendarString, now) {

  return calendarString.replace(now.date().toString(),
    require('chalk').blue(now.date().toString()));
}

function highlightTaskDueDate(calendarString, dueDate) {
  return calendarString.replace(`${dueDate.date()}`,`${require('chalk').red(dueDate.date())}`);
}
