/**
 *
 * Returns a Promise string for printing tasks to the console.
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
const POINTS_COLUMN_LABEL      = 'Points left';
const STATUS_COLUMN_LABEL      = 'Status';
const DUE_DATE_COLUMN_LABEL    = 'Due Date';

const DEFAULT_HEADER = [
  require('chalk').underline(ID_COLUMN_LABEL),
  require('chalk').underline(AGE_COLUMN_LABEL),
  require('chalk').underline(PROJECT_COLUMN_LABEL),
  require('chalk').underline(DESCRIPTION_COLUMN_LABEL),
  require('chalk').underline(DUE_DATE_COLUMN_LABEL),
  require('chalk').underline(STATUS_COLUMN_LABEL),
  require('chalk').underline(OWNER_COLUMN_LABEL),
  require('chalk').underline(POINTS_COLUMN_LABEL),
  require('chalk').underline(URGENCY_COLUMN_LABEL)
];

PrintUtil.prototype.printTasks = function(filteredTasks) {

  return new Promise( (resolve,reject) => {
    var taskList = Object.values(filteredTasks);
    if (taskList.length === 0) /* Only construct output if tasks are present */
      resolve(`0 tasks`);

    const chalk = require('chalk');

    var data = [];
    data.push(DEFAULT_HEADER);

    taskList.forEach((task) => {
      data.push([
        task.id,
        getAgeString(task.creationDate),
        getProjectString(filteredTasks, task),
        task.title,
        chalk.italic(getDateString(task.dueDate)),
        'In Progress', //TODO Status string should be dependent on last annotation.
        task.owner,
        task.points,
        '0.5']) //TODO
    });

    var output = createTable(data);
    output += `\n(${taskList.length} task${ (taskList.length) === 1 ? '':'s'})\n`; /* i.e. Prints (1 task). */

    resolve(output);
  });

}

PrintUtil.prototype.printTask = function(task) {
  const chalk = require('chalk');
  const dao   = require('../dao');

  var generalTaskData     = [];
  var annotationTaskData  = [];

  generalTaskData.push(DEFAULT_HEADER);

  generalTaskData.push([
    task.id,
    getAgeString(task.creationDate),
    getProjectString(dao.getAppData().allTasks, task),
    task.title,
    chalk.italic(getDateString(task.dueDate)),
    'In Progress', //TODO
    task.owner,
    task.points,
    '0.5']);

  task.annotations.reverse().forEach((annotation) => {
    annotationTaskData.push([
      require('moment')(annotation.date).from(require('moment')()),
      annotation.pointUpdate,
      annotation.comment,
      annotation.updatedBy
    ]);
  });

  var generalTableOut, annoationTableOut = '';
  if (generalTaskData.length > 0)
    generalTableOut   = createTable(generalTaskData);

  if (annotationTaskData.length > 0)
    annoationTableOut = createTable(annotationTaskData);

  console.log(`${generalTableOut}\n\nUpdates:\n\n${annoationTableOut}`);
}

/* ======================== Helpers ======================== */

function getDateString(date) {
  var moment      = require('moment-timezone');
  const timezone  = config.timezone;

  return moment(date).tz(timezone).format("dddd, MMMM Do YYYY");
}

function getAgeString(date) {
  var moment          = require('moment');
  var timeDifference  = moment().diff(moment(date), 'days');
  return timeDifference.toString();
}

function getProjectString(tasks, task) {
  if (task.project)
    return `${task.project}(id:${task.id})`;
  else if(tasks[task.parentTaskId])
    return `${tasks[task.parentTaskId].project}(id:${tasks[task.parentTaskId].id})`;
  else
    return '/';
}

function createTable(tableData) {
  const {table}               = require('table');
  const getBorderCharacters   = require('table').getBorderCharacters;

  const output = table(tableData, {
      border: getBorderCharacters(`void`),
      columnDefault: {
          paddingLeft: 0,
          paddingRight: 2
      },
      drawHorizontalLine: () => {
          return false;
      }
    });
  return output;
}

module.exports = PrintUtil;
