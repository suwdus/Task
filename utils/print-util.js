/**
 *
 * Returns a Promise string for printing tasks to the console.
 *
 * @author Philip M. Turner
 *
 */

function PrintUtil() {}

const AGE_COLUMN_LABEL               = 'Age';
const ID_COLUMN_LABEL                = 'ID';
const PROJECT_COLUMN_LABEL           = 'Project';
const DESCRIPTION_COLUMN_LABEL       = 'Description';
const OWNER_COLUMN_LABEL             = 'Owner';
const POINTS_COLUMN_LABEL            = 'Points left';
const STATUS_COLUMN_LABEL            = 'Status';
const LAST_UPDATED_DATE_COLUMN_LABEL = 'Last Updated';
const DUE_DATE_COLUMN_LABEL          = 'Due Date';
//const URGENCY_COLUMN_LABEL         = 'Urg'; Not in use.

const DEFAULT_HEADER = [
  require('chalk').underline(ID_COLUMN_LABEL),
  require('chalk').underline(AGE_COLUMN_LABEL),
  require('chalk').underline(PROJECT_COLUMN_LABEL),
  require('chalk').underline(DESCRIPTION_COLUMN_LABEL),
  require('chalk').underline(DUE_DATE_COLUMN_LABEL),
  require('chalk').underline(STATUS_COLUMN_LABEL),
  require('chalk').underline(OWNER_COLUMN_LABEL),
  require('chalk').underline(POINTS_COLUMN_LABEL),
  require('chalk').underline(LAST_UPDATED_DATE_COLUMN_LABEL)
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
        getProjectString(require('../dao').getAppData().tasks, task),
        task.title,
        chalk.italic(getDateString(task.dueDate)),
        getStatusString(task),
        task.owner,
        getPointsLeftString(task),
        getLastUpdatedDateString(task)])
    });

    var output = createTable(data);
    output += `\n(${taskList.length} task${ (taskList.length) === 1 ? '':'s'})\n`; /* i.e. Prints (1 task). */

    resolve(output);
  });

}

PrintUtil.prototype.printTask = function(task) {
  if (!task) {
    console.log(`Task does not exist`); return;
  }

  const chalk = require('chalk');
  const dao   = require('../dao');

  var generalTaskData     = [];
  var annotationTaskData  = [];

  generalTaskData.push(DEFAULT_HEADER);

  generalTaskData.push([
    task.id,
    getAgeString(task.creationDate),
    getProjectString(dao.getAppData().tasks, task),
    task.title,
    chalk.italic(getDateString(task.dueDate)),
    getStatusString(task),
    task.owner,
    getPointsLeftString(task),
    getLastUpdatedDateString(task)]);

  task.annotations.forEach((annotation) => {
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

//TODO: Move to Task object definition...
function getDateString(date) {
  var moment      = require('moment-timezone');
  const timezone  = config.timezone;

  return moment(date).tz(timezone).format("dddd, MMMM Do YYYY");
}

//TODO: Move to Task object definition...
function getAgeString(date) {
  var moment          = require('moment');
  var timeDifference  = moment().diff(moment(date), 'days');
  return timeDifference.toString();
}

//TODO: Move to Task object definition...
function getProjectString(tasks, task) {
  if (task.project)
    return task.title;
  else if (tasks[task.parentTaskId])
    return `${tasks[task.parentTaskId].title}`;
  else
    return '/';
}

//TODO: Move to Task object definition...
function getStatusString(task) {
  var _ = require('underscore');
  var moment = require('moment');

  if (task.complete)
    return 'Complete';
  else if (_.isEmpty(task.annotations))
    return 'Stalled';

  const lastAnnotation = _.max(task.annotations, (annotation) => {
    return moment(annotation.date).unix()
  });

  const twoDaysAgo          = moment().subtract({hours: 48});
  const lastAnnotationDate  = moment(lastAnnotation.date);

  if (lastAnnotationDate.isAfter(twoDaysAgo)) {
    return 'In Progress';
  } else {
    return 'Stalled';
  }
}

//TODO: Move to Task object definition...
function getLastUpdatedDateString(task) {
  if (task.annotations.length === 0)
    return 'No updates';

  return require('moment-timezone')(task.annotations.reverse()[0].date).tz(config.timezone).from(require('moment')());
}

//TODO: Move to Task object definition...
function getPointsLeftString(task) {
  if (task.subtasks.length === 0) {
    return task.points;
  }

  function getPoints(task) {
    if (! task)
      return 0;

    var count = 0;
    task.subtasks.forEach( (subtaskId) => {
      subtask = require('../dao').getAllTasks()[subtaskId];
      count += getPoints(subtask);
    });
    count += task.points;
    return count;
  }

  return getPoints(task);
}

function createTable(tableData) {
  const {table}               = require('table');
  const getBorderCharacters   = require('table').getBorderCharacters;

  const output = table(tableData, {
      border: getBorderCharacters(`void`),
      /*
      columns: {
        2: {
          width: 80,
          wordWrap: true
        }
      },
      */
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

module.exports = new PrintUtil();
