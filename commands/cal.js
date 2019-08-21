/**
 *
 * @author Philip M. Turner
 *
 */


/* Prints the user's task calendar to the terminal window. */
module.exports = function printCalendar(tasks) {
  const childProcess  = require('child_process');

  var thisCal, prevCal, nextCal;

  var events                = require('events');
  var eventEmitter          = new events.EventEmitter();
  var childProcessDoneCount = 0;

  //Assemble calendar string and add date highlighting once all calenders have returned...
  eventEmitter.on('retrievedCal', () => {
    childProcessDoneCount++;

    if (childProcessDoneCount == 3)
      console.log( /* Print 3-Calendar display to console */
        buildCalendarOutput(
          tasks,
          prevCal,
          thisCal,
          nextCal)
      );
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
}

function buildCalendarOutput(tasks, cal1, cal2, cal3) {
  const chalk         = require('chalk');

  const legend        = `Legend: ` +
                          ` ${chalk.blue('today')},` +
                          ` ${chalk.red('due')}, `+
                          ` ${chalk.yellow('due-today')},`+
                          ` ${chalk.bold('overdue')},`+
                          ` weekend,`+
                          ` ${chalk.green('holiday')},`+
                          ` ${chalk.underline('weeknumber')}.`

  var calendarString = '';

  /**
   * Join months together once highlights have been added
   * TODO: Put in helper...
   *
   */
  const colorCal1 = colorize(tasks, cal1).split('\n');
  const colorCal2 = colorize(tasks, cal2).split('\n');
  const colorCal3 = colorize(tasks, cal3).split('\n');

  var calendarAll = '';
  for (var j = 0; j < colorCal1.length; j++)
    calendarAll += `\n${colorCal1[j].padEnd(20)}  ${colorCal2[j].padEnd(20)}  ${colorCal3[j].padEnd(20)}`;
  calendarAll += `\n${legend}\n`;

  return calendarAll;
}

function colorize(tasks, cal) {
  var colorCalString  = cal.calendarString; //Will transform calendar string...

  //Remove month header in first line of calendar...
  var idx       = colorCalString.match('\n').index;
  var headerStr = colorCalString.slice(0, idx+1)
  colorCalString      = colorCalString.slice(idx+1, colorCalString.length);

  tasks.forEach((task) => {
    if (task.dueDate) { /* TODO: Only highlight if date of task corresponds to calendar month */
      const dd = new Date(task.dueDate).getDate();
      colorCalString = colorCalString.replace(` ${dd.toString()}`, ` ${require('chalk').red(dd.toString())}`);
    }
  });

  //Add the month header back to the calendar string...
  colorCalString = headerStr + colorCalString;

  //Apply additional transformations...
  colorCalString = highlightToday(cal, colorCalString);

  return colorCalString;
}

function highlightToday(calObj, colorCalString) {
  const now = new Date();

  if (calObj.month !== now.getMonth()+1)
    return colorCalString; /* Only highlight day on this month's calendar. */

  return colorCalString.replace(now.getDate(),
    require('chalk').blue(now.getDate()));
}
