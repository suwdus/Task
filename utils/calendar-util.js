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

  var calendarString    = cal.calendarString;
  const firstLineEndIdx = calendarString.match('\n').index;
  const headerStr       = calendarString.slice(0, firstLineEndIdx+1)

  //Remove month header in first line of calendar...
  calendarString  = calendarString.slice(firstLineEndIdx+1, calendarString.length);
  //Highlight today, task due dates
  calendarString  = highlightDates(calendarString, cal.month, tasks);

  //Add the month header back to the calendar string...
  calendarString = headerStr + calendarString;

  //TODO:Print current, due soon tasks to the console.

  return calendarString;
}

function highlightDates(calendarString, calendarMonthNum, tasks) {
  var highlightedDatesForMonths = {};
  var moment            = require('moment-timezone');
  const now             = require('moment-timezone')().tz(config.timezone);
  var todayHasTasksDue  = false;

  for (let task of tasks) {
    if (task.dueDate) {
      const dueDate           = moment(task.dueDate).tz(config.timezone);
      const taskDueDateMonth  = dueDate.month()+1;

      if (taskDueDateMonth !== calendarMonthNum)
        continue;
      else if (! highlightedDatesForMonths[taskDueDateMonth])
        highlightedDatesForMonths[taskDueDateMonth] = [];
      else if (highlightedDatesForMonths[taskDueDateMonth].includes(dueDate.date()))
        continue;

      const shouldHighlightDate = (calendarMonthNum === taskDueDateMonth) &&
        (highlightedDatesForMonths[taskDueDateMonth].includes(dueDate.date()) === false);

      var dateRegex = `( | \n)${dueDate.date()}( |\n)`;
      var match     = calendarString.match(dateRegex, 'g');

      if (!match) {
        //Adjust regex to account for dates which begin the string.
        dateRegex = `${dueDate.date()} `;
        match = calendarString.match(dateRegex);
      }
      const color = (
                      calendarMonthNum === taskDueDateMonth
                      && calendarMonthNum === now.month()+1
                      && dueDate.date() === now.date()
                    ) ? require('chalk').yellow : require('chalk').red;

      const highlightedCalendarString = calendarString.replace(
        match[0],
        `${color(match[0])}`);

      highlightedDatesForMonths[taskDueDateMonth].push(dueDate.date());

      calendarString = (shouldHighlightDate) ? highlightedCalendarString : calendarString;
    }
  }

  return calendarString;
}
module.exports = CalendarUtil;
