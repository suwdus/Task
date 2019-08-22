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

/* Maintains column ordering, labels and length restrictions.
 *
 * `minLen`, `maxLen`, `endValChar` are used to support dynamic column padding.
 *
 */
const columns = [
    { colKey: ID_COLUMN_LABEL,           lengthRestriction: 50, maxLen: -1, minLen: ID_COLUMN_LABEL.length, endValChar: '_'},
    { colKey: AGE_COLUMN_LABEL,          lengthRestriction: 50, maxLen: -1, minLen: AGE_COLUMN_LABEL.length, endValChar: '~' },
    { colKey: PROJECT_COLUMN_LABEL,      lengthRestriction: 50, maxLen: -1, minLen: PROJECT_COLUMN_LABEL.length, endValChar: '@' },
    { colKey: DESCRIPTION_COLUMN_LABEL,  lengthRestriction: 50, maxLen: -1, minLen: DESCRIPTION_COLUMN_LABEL.length, endValChar: '#' },
    { colKey: DUE_DATE_COLUMN_LABEL,     lengthRestriction: 50, maxLen: -1, minLen: DUE_DATE_COLUMN_LABEL.length, endValChar: '`' },
    { colKey: URGENCY_COLUMN_LABEL,      lengthRestriction: 50, maxLen: -1, minLen: URGENCY_COLUMN_LABEL.length, endValChar: '!' }
];

module.exports = function printTasks(tasks, filters) {

  var header  = '';

  //Create task table header adding default padding...
  //TODO: underline each column title...
  columns.forEach((column) => {
    header += `${(column.colKey + column.endValChar).padEnd(column.lengthRestriction)} `;
  });

  var tasksOutputStr = '';

  if (tasks.length > 0) /* Only include header if the user has tasks */
    tasksOutputStr += `${header}\n`;

  tasks.forEach( (task) => {
    var taskStr = '';

    //Construct row for task...
    columns.forEach((column) => {
      const curMaxLen   = column['maxLen'];
      const columnValue = getColVal(column.colKey, task); //i.e. 'Sample Task 1 long description'
      column['maxLen']  = (columnValue.length > curMaxLen) ? columnValue.length : curMaxLen;

      //Pad task row...
      taskStr += `${(columnValue + column.endValChar).padEnd(column.lengthRestriction)} `;
    });

    tasksOutputStr += `${taskStr}\n`;
  });

  /* Trim excess white space from task output */
  columns.forEach((columnDefinition) => {
    tasksOutputStr = trimExcessWhitespace(columnDefinition, tasksOutputStr);
  });

  console.log(tasksOutputStr);

  console.log(`\n(${tasks.length} task${ (tasks.length) === 1 ? '':'s'})`); /* i.e. Prints (1 tasks). */

}

/* ======================== Helpers ======================== */

function getColVal(colKey, task) {
  switch (colKey) {
    case ID_COLUMN_LABEL:
      return '1';             /* TODO: */
    case AGE_COLUMN_LABEL:
      return getAgeFromDate(task.creationDate);
    case PROJECT_COLUMN_LABEL:
      return task.project;
    case URGENCY_COLUMN_LABEL:
      return '.05';           /* TODO: */
    case DESCRIPTION_COLUMN_LABEL:
      return task.title;
    case DUE_DATE_COLUMN_LABEL:
      return getDateString(task.dueDate);
  }
}

function getDateString(date) {
  return require('moment')(date).format("dddd, MMMM Do YYYY");
}

function getAgeFromDate(date) {
  var moment = require('moment');
  var thing = moment(date).diff(moment(), 'days');
  return thing.toString();
}

function trimExcessWhitespace(columnDefinition, tasksOutputStr) {
  const excessWhitespaceCount = columnDefinition.lengthRestriction - columnDefinition.maxLen-3;
  const re = new RegExp(`${columnDefinition.endValChar}.{${excessWhitespaceCount}}`, 'g');
  return tasksOutputStr.replace(re,'');
}
