/**
 *
 * @author Philip M. Turner
 *
 */


/* task ls|l ? <filter */


/* Column labels */
const AGE_COLUMN_LABEL         = 'Age';
const ID_COLUMN_LABEL          = 'ID';
const PROJECT_COLUMN_LABEL     = 'Project';
const URGENCY_COLUMN_LABEL     = 'Urg';
const DESCRIPTION_COLUMN_LABEL = 'Description';
const DUE_DATE_COLUMN_LABEL    = 'Due Date';

module.exports = function getTaskListTerminalOutput(tasks, filters) {

  return new Promise( (resolve,reject) => {
    if (tasks.length === 0) /* Only construct output if tasks are present */
      resolve(`0 tasks`);

    const {table}               = require('table');
    const getBorderCharacters   = require('table').getBorderCharacters;
    const chalk                 = require('chalk');

    var data = [];

    //Add header...
    data.push([
      chalk.underline(ID_COLUMN_LABEL),
      chalk.underline(AGE_COLUMN_LABEL),
      chalk.underline(PROJECT_COLUMN_LABEL),
      chalk.underline(DESCRIPTION_COLUMN_LABEL),
      chalk.underline(DUE_DATE_COLUMN_LABEL),
      chalk.underline(URGENCY_COLUMN_LABEL)
    ]);

    tasks.forEach((task) => {
      data.push([
        '1',    //TODO
        getAgeFromDate(task.creationDate),
        task.project,
        task.title,
        getDateString(task.dueDate),
        '0.5']) //TODO
    });

    var output = table(data, {
      border: getBorderCharacters(`void`),
      columnDefault: {
          paddingLeft: 0,
          paddingRight: 1
      },
      drawHorizontalLine: () => {
          return false
      }
    });

    output += `\n(${tasks.length} task${ (tasks.length) === 1 ? '':'s'})\n`; /* i.e. Prints (1 task). */

    resolve(output);
  });

}

/* ======================== Helpers ======================== */

function getDateString(date) {
  return require('moment')(date).format("dddd, MMMM Do YYYY");
}

function getAgeFromDate(date) {
  var moment = require('moment');
  var thing = moment(date).diff(moment(), 'days');
  return thing.toString();
}
