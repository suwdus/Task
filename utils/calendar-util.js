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
CalendarUtil.prototype.getCalendarView = function (tasks) {
    var calendarOutputPromise = new Promise( (resolve, reject) => {
      var output = buildCalendarOutput(tasks);
      resolve(output);
  });
  return calendarOutputPromise;
}

function buildCalendarOutput(tasks) {
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

  //Months to construct...
  const thisMonthNum = require('moment')().month()+1;
  const prevMonthNum = thisMonthNum-1;
  const nextMonthNum = thisMonthNum+1;
   /* Highlight calendar dates according to tasks and split on `\n` */
  const splitCal1 = highlight(tasks, prevMonthNum).split('\n');
  const splitCal2 = highlight(tasks, thisMonthNum).split('\n');
  const splitCal3 = highlight(tasks, nextMonthNum).split('\n');

  /* Combine calendars */
  var calendarAll = ''; const len = 7;
  for (var j = 0; j < len; j++) {
    calendarAll += `\n${splitCal1[j].padEnd(20)}  ${splitCal2[j].padEnd(20)}  ${splitCal3[j].padEnd(20)}`;
  }
  calendarAll += `\n\n${legend}\n`;

  return calendarAll;
}

function highlight(tasks, calendarMonthNum) {
  const moment           = require('moment-timezone');
  const monthBeginMoment = moment().month(calendarMonthNum-1);
  const monthEndMoment   = monthBeginMoment.endOf('month');

  const daysInMonth      = monthEndMoment.date();
  const dayOfWeekMonthStartsOn = monthBeginMoment.isoWeekday();
  const dayOfWeekMonthEndsOn   = monthEndMoment.isoWeekday();
  const monthHeader            = require('center-align')(monthBeginMoment.format('MMMM YYYY'),20);

  //Construct array of dates...
  var dateSlots = [];
  for(var d = 1; d <= daysInMonth; d++) {
    dateSlots.push(`${d}`.padStart(2));
  }
  //Highlight dates according to task due dates...

  const highlightedDatesForMonth = [];
  const projectIds      = require('../dao').getProjects();
  const now             = moment().tz(config.timezone);
  const projectColors   = ['magenta','green','yellow','purple','grey'];
  var projectColorMap   = {};

  /* Assign each project to a color from the array */
  for (var i = 0; i < projectIds.length; i++) {
    projectColorMap[projectIds[i]] = projectColors[i];
  }

  for (let task of tasks) {
    if (task.dueDate) {
      const dueDate           = moment(task.dueDate).tz(config.timezone);
      const taskDueDateMonth  = dueDate.month()+1;

      if (taskDueDateMonth !== calendarMonthNum) /* task date belongs to different calendar */
        continue;
      else if (highlightedDatesForMonth.includes(dueDate.date())) /* calendar date already highlighted for calendar */
        continue; /* Important: If multiple project tasks due on same date only one color will show */

      const date  = dueDate.date();
      const dateIndex = date-1;
      const regex = /[0-9]+/;
      const dateSlotString = dateSlots[dateIndex];
      const match = dateSlotString.match(regex);

      const isTaskDueDateToday = calendarMonthNum === now.month()+1    //Calendar is related to this month
                              && taskDueDateMonth === calendarMonthNum //Task is also related to this month (this is a double check)
                              && dueDate.date() === now.date();        //Task is due today

      const thisIdOrProjectId = (task.project) ? task.id : task.parentTaskId;
      const projectColorHighlightOrDefault = (thisIdOrProjectId) ?
              require('chalk')[projectColorMap[thisIdOrProjectId]] : require('chalk').red;

      const colorize = isTaskDueDateToday ? require('chalk').yellow : projectColorHighlightOrDefault;

      if(match)
        dateSlots[dateIndex] = dateSlotString.replace(regex, require('chalk').bold(colorize(match[0])));
      else
        console.log('no match');

      highlightedDatesForMonth.push(dueDate.date());
    }
  }

  //If we still haven't highlighted today's date...
  if (calendarMonthNum === now.month()+1
    && highlightedDatesForMonth.includes(now.date()) === false) {

    const regex = /[0-9]+/;
    const dateIndex = now.date()-1;
    const dateSlotString = dateSlots[dateIndex];
    const match = dateSlotString.match(regex);

    dateSlots[dateIndex] = dateSlotString.replace(regex, require('chalk').blue(match[0]));
  }


  //Now we add slots to the beginning according to the first day.
  for (var k = 1; k < dayOfWeekMonthStartsOn-1; k++) {
    dateSlots.unshift(''.padStart(2));
  }


  for (var l= 1; l < 7 - dayOfWeekMonthEndsOn; l++) {
    dateSlots.push(''.padStart(2));
  }

  //Assmeble the date string...
  var out = '';
  for (var j = 1; j <= dateSlots.length; j++) {
    const adjacentStr = (j%7 === 0) ? '\n' : ' ';
    out += `${dateSlots[j-1]}${adjacentStr}`;
  }

  const headerStr        = 'Su Mo Tu We Th Fr Sa';
  out = `${monthHeader}\n${headerStr}\n${out}`;
  return out;
}
/* Highlight dates for a single calendar */
module.exports = new CalendarUtil();
