/**
 *
 * Externally callable methods return a Promise containing
 * the task calendar string.
 *
 * @author Philip M. Turner
 *
 */

function CalendarUtil() {
}

/* Will return a Promise containing the task calendar. */
CalendarUtil.prototype.getCalendarView = function (requestedTasks) {
    var calendarOutputPromise = new Promise( (resolve, reject) => {
    var events                = require('events');
    var eventEmitter          = new events.EventEmitter();
    var childProcessDoneCount = 0;

    /* Prepare emitter to receive events */
    eventEmitter.on('retrievedCal', () => {
      childProcessDoneCount++;

      if (childProcessDoneCount === 3) {
        resolve(
          buildCalendarOutput( /* Highlight dates & assemble calendar output */
            requestedTasks,
            this.prevCal,
            this.thisCal,
            this.nextCal)
        );
      }
    });

    /* Spawn child processes to retrieve each calendar and notify the emitter */
    spawnChildProcessesNotifyEmitter(eventEmitter, this);
  });

  return calendarOutputPromise;

}

/* ======================== Helpers ======================== */
function spawnChildProcessesNotifyEmitter(
            eventEmitter, _this) {
  //Use default os `cal` program to build calendar strings...
  const now           = new Date();
  const currentMonth  = now.getMonth()+1; //date month indexed from 0.
  const currentYear   = now.getYear();

  const prevCalChildProcess     = require('child_process').spawn('cal', [currentMonth-1,'2019']);
  const currentCalChildProcess  = require('child_process').spawn('cal');
  const nextCalChildProcess     = require('child_process').spawn('cal',[currentMonth+1,'2019']);

  function relateChildProcessCalOutputToThis(calendar, month, childPrecess) {
    childPrecess.stdout.on('data', (osCalStdin) => {
      _this[calendar] = {
        month:month,
        calendarString: osCalStdin.toString()
      };
      eventEmitter.emit('retrievedCal');
    });
  }

  relateChildProcessCalOutputToThis('prevCal', currentMonth-1, prevCalChildProcess);
  relateChildProcessCalOutputToThis('thisCal', currentMonth, currentCalChildProcess);
  relateChildProcessCalOutputToThis('nextCal', currentMonth+1, nextCalChildProcess);

}

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

  //Apply additional transformations...
  calendarString = (cal.month === now.month()+1) ? highlightToday(calendarString, now) : calendarString;
  //Add the month header back to the calendar string...
  calendarString = headerStr + calendarString;

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

module.exports = CalendarUtil;
