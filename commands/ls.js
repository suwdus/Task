/**
 *
 * @author Philip M. Turner
 *
 */


/* task ls|l ? <filter */

const chalk = require('chalk');

/* Column labels */
const AGE_COLUMN_STRING         = 'Age';
const ID_COLUMN_STRING          = 'ID';
const PROJECT_COLUMN_STRING     = 'Project';
const URGENCY_COLUMN_STRING     = 'Urg';
const DESCRIPTION_COLUMN_STRING = 'Description';

/* For limiting text output length */
const SHORT_TEXT_LENGTH_RESTRICTION   = 3;
const MEDIUM_TEXT_LENGTH_RESTRICTION  = 15;
const LONG_TEXT_LENGTH_RESTRICTION    = 25;

/* Maintains column ordering, labels and length restrictions */
const columns = [
    { colKey: ID_COLUMN_STRING,           lengthRestriction: SHORT_TEXT_LENGTH_RESTRICTION},
    { colKey: AGE_COLUMN_STRING,          lengthRestriction: SHORT_TEXT_LENGTH_RESTRICTION },
    { colKey: PROJECT_COLUMN_STRING,      lengthRestriction: MEDIUM_TEXT_LENGTH_RESTRICTION },
    { colKey: DESCRIPTION_COLUMN_STRING,  lengthRestriction: LONG_TEXT_LENGTH_RESTRICTION },
    { colKey: URGENCY_COLUMN_STRING,      lengthRestriction: SHORT_TEXT_LENGTH_RESTRICTION }];

module.exports = function (tasks) {

  //Create task table header, underline each column title...
  var header  = '';

  columns.forEach((column) => {
    header += `${chalk.underline(column.colKey.padEnd(column.lengthRestriction))} `;
  });

  if (tasks.length > 0) /* Only print header if the user has tasks */
    console.log(header);

  tasks.forEach( (task) => {
    var taskStr = '';

    columns.forEach((column) => {
      //Construct task string...
      taskStr += `${getColVal(column.colKey, task).padEnd(column.lengthRestriction)} `;
    });

    //Print the task...
    console.log(taskStr);
  });
  console.log(`\n${tasks.length} tasks`);
}

/* ======================== Helpers ======================== */

function getColVal(colKey, task) {
  switch (colKey) {
    case ID_COLUMN_STRING:
      return '6d';            /* TODO: */
    case AGE_COLUMN_STRING:
      return '1';             /* TODO: */
    case PROJECT_COLUMN_STRING:
      return 'Cool Project';  /* TODO: */
    case URGENCY_COLUMN_STRING:
      return '.05';           /* TODO: */
    case DESCRIPTION_COLUMN_STRING:
      return task.title;
  }
}
