/**
 *
 * Description: Handles app configuration, uploading/retrieving
 * to dependent services.
 *
 *
 * @author Philip M. Turner
 *
 */

function PrintUtil() {}

const AGE_COLUMN_LABEL         = 'Age';
const ID_COLUMN_LABEL          = 'ID';
const PROJECT_COLUMN_LABEL     = 'Project';
const URGENCY_COLUMN_LABEL     = 'Urg';
const DESCRIPTION_COLUMN_LABEL = 'Description';
const OWNER_COLUMN_LABEL       = 'Owner';
const DUE_DATE_COLUMN_LABEL    = 'Due Date';

PrintUtil.prototype.printTasks = function(filteredTasks) {

  return new Promise( (resolve,reject) => {
    var taskList = Object.values(filteredTasks);
    if (taskList.length === 0) /* Only construct output if tasks are present */
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
      chalk.underline(OWNER_COLUMN_LABEL),
      chalk.underline(URGENCY_COLUMN_LABEL)
    ]);

    taskList.forEach((task) => {
      data.push([
        task.id,
        getAgeString(task.creationDate),
        getProjectString(filteredTasks, task),
        task.title,
        chalk.italic(getDateString(task.dueDate)),
        task.owner,
        '0.5']) //TODO
    });

    var output = table(data, {
      border: getBorderCharacters(`void`),
      columnDefault: {
          paddingLeft: 0,
          paddingRight: 1
      },
      drawHorizontalLine: () => {
          return false;
      }
    });

    output += `\n(${taskList.length} task${ (taskList.length) === 1 ? '':'s'})\n`; /* i.e. Prints (1 task). */

    resolve(output);
  });

}

/* ======================== Helpers ======================== */

function getDateString(date) {
  var moment      = require('moment-timezone');
  const timezone  = config.timezone;

  return moment(date).tz(timezone).format("dddd, MMMM Do YYYY");
}

function getAgeString(date) {
  var moment = require('moment');
  var thing = moment(date).diff(moment(), 'days');
  return thing.toString();
}

function getProjectString(tasks, task) {
  if (task.project)
    return `${task.project}(id:${task.id})`;
  else if(tasks[task.parentTaskId])
    return `${tasks[task.parentTaskId].project}(id:${tasks[task.parentTaskId].id})`;
  else
    return '/';
}

module.exports = PrintUtil;
