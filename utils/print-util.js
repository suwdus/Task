/**
 *
 * Returns a Promise string for printing tasks to the console.
 *
 * @author Philip M. Turner
 *
 */

function PrintUtil() {}

const AGE_COLUMN_LABEL               = 'Age',
      ID_COLUMN_LABEL                = 'ID',
      PROJECT_COLUMN_LABEL           = 'Project',
      DESCRIPTION_COLUMN_LABEL       = 'Description',
      OWNER_COLUMN_LABEL             = 'Owner',
      POINTS_COLUMN_LABEL            = 'Points left',
      STATUS_COLUMN_LABEL            = 'Status',
      LAST_UPDATED_DATE_COLUMN_LABEL = 'Last Updated',
      DUE_DATE_COLUMN_LABEL          = 'Due Date';
      //const URGENCY_COLUMN_LABEL   = 'Urg'; Not in use.

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

PrintUtil.printTasks = function(filteredTasks) {

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
                task.getAgeString(),
                task.getProjectString(),
                task.title,
                chalk.italic(task.getDateString()),
                task.getStatus(),
                task.owner,
                task.getPointsLeftString(),
                task.getLastUpdatedDateString()])
        });

        var output = createTable(data);
        output = output.split('\n').map( (line, i) => (i % 2 === 0) ? line : chalk.bgBlue(chalk.white(line))).join('\n');
        output += `\n(${taskList.length} task${ (taskList.length) === 1 ? '':'s'})\n`; /* i.e. Prints (1 task). */

        resolve(output);
    });

}

PrintUtil.printTask = function(task) {
    const generalTaskData = [],
        annotationTaskData = [],
        dao   = require('../dao');
        chalk = require('chalk');

    var generalTableOut = '',
        annoationTableOut = '';

    if (!task) {
        console.log(`Task does not exist`); return;
    }

    generalTaskData.push(DEFAULT_HEADER);

    generalTaskData.push([
        task.id,
        task.getAgeString(),
        task.getProjectString(),
        task.title,
        chalk.italic(task.getDateString()),
        task.getStatus(),
        task.owner,
        task.getPointsLeftString(),
        task.getLastUpdatedDateString()]);

    task.annotations.forEach((annotation) => {
        annotationTaskData.push([
            require('moment')(annotation.date).from(require('moment')()),
            annotation.pointUpdate,
            annotation.comment,
            annotation.updatedBy
        ]);
    });

    if (generalTaskData.length > 0)
        generalTableOut     = createTable(generalTaskData);

    if (annotationTaskData.length > 0)
        annoationTableOut = createTable(annotationTaskData);

    var questions = '';
    if (task.questions) {
        task.questions.forEach( (q,i) => questions += `${i+1}. ${q}\n`);
    }

    console.log(`${generalTableOut}\n\nUpdates:\n\n${annoationTableOut}\nQuestions:\n${questions}`);
}

/* ======================== Helpers ======================== */

function createTable(tableData) {
    const {table}             = require('table');
    const getBorderCharacters = require('table').getBorderCharacters;

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

module.exports = PrintUtil;
