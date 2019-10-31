/**
 *
 * @author Philip M. Turner
 *
 */


/* task add|a */

const moment = require('moment-timezone');

function SprintCommand(appData) {
    this.appData = appData;
    this.dao     = require('../dao/');
    this.util    = require('../utils/command-util');

    this.printUtil   = require('../utils/print-util');
    this.calendarUtil = require('../utils/calendar-util');
}

SprintCommand.prototype.run = function (args) {
    const _ = require('underscore');

    var subCommand = process.argv[3];

    if (_.isUndefined(subCommand))
        subCommand = 'ls'; /* Default subcommand to show the sprint */

    if ( (subCommand !== 'new' && subCommand !== 'select') &&
        _.isUndefined(config.tmp.selectedSprintId)) { /* Subcommands besides these require sprint selection */
        console.log('Please select a sprint before running this command');
        process.exit();
    }

    if (subCommand === 'new') {
        processNewSprint(args);
    } else if (subCommand === 'select') {
        this.selectSprint(args);
    } else if (subCommand    === 'ls') {
        this.showSprint();
    } else if (subCommand    === 'add') {
        this.addTasks(args);
    } else if (subCommand    === 'remove') {
        this.removeTask(args);
    } else if (subCommand    === 'commit') {
        this.commitSprint(args);
    }
}

SprintCommand.prototype.selectSprint = function (args) {
    const _        = require('underscore'),
          dao      = require('../dao'),
          sprintId = args.sprintId;

    if (_.isUndefined(args.sprintId) ) {
        console.log('Please specify --sprintId flag');
        process.exit();
    }

    dao.selectSprint(sprintId);
}

SprintCommand.prototype.addTasks = function(args) {
    const _                      = require('underscore'),
          SprintTaskModelBuilder = require('../builders/sprint-task-model-builder'),
          taskIds                = [ args.taskIds ];

    if (_.isUndefined(args.taskIds) ) {
        console.log('Please specify --taskIds flag');
        process.exit();
    }

    _.each(taskIds, (taskId) => {
        this.dao.addSprintTask(SprintTaskModelBuilder.build(taskId));
    });
}

SprintCommand.prototype.showSprint = function() {
    var _ = require('underscore');

    const sprintId = this.appData.currentSprintId;

    if (_.isUndefined(sprintId) || _.isNull(sprintId)) { /* Exit if current sprint hasn't been selected */
        console.log('No current sprint available');
        process.exit();
    }
    const sprint = this.appData.sprints[sprintId];

    console.log(require('chalk').blue(require('chalk').bold(`\n\n<<Sprint>>: ${sprint.name}\n`)));

    var taskListOutputPromise = this.printUtil.printTasks(require('../utils/data-util').getTasksForCurrentSprint())
    var calendarOutputPromise = this.calendarUtil.getCalendarView(require('../utils/data-util').getAllTasks());

    calendarOutputPromise
    .then((calendarOutput) => {
        taskListOutputPromise.then((taskList) => {
            var out = `Currently in Q${moment().quarter()} ` + `${moment().year().toString()}\n\n` +
                                `${moment().tz(config.timezone).format("ddd, hA")}\n` +
                                `${calendarOutput}\n` +
                                `${taskList}`;
            console.log(out);
        });
    });

}

SprintCommand.prototype.commitSprint = async function(args) {
    const sprintId = this.appData.currentSprintId,
          sprint = this.appData.sprints[sprintId],
          sprintTasks = sprint.sprintTasks,
          sprintTaskIds = Object.keys(sprintTasks),
          argPrompt = [{argKey: 'commitMessage', prompt: 'Commit message: ', value: ''},
              {argKey: 'happyMeter', prompt: 'Are you happy with the work you did here?: ', value: 'yes'}],
          mappedSprintTasks = {};

    for(var i = 0; i < sprintTaskIds.length; i++) {
        const taskId = sprintTaskIds[i], /* Get task information */
              task = this.appData.tasks[taskId],
              printOutputPromise = await this.printUtil.printTasks([this.appData.tasks[taskId]]);

        /* Print sprint task to the console... */
        console.log(printOutputPromise);

        /* Add commit date and commit message to sprint task */
        await this.util.constructArgsInteractively(argPrompt)
            .then( (constructedArgs) => {
                mappedSprintTasks[taskId] = {
                    ...sprintTasks[taskId],
                    commitStatus: task.getStatus(),
                    commitDate: require('moment')(),
                    commitMessage: constructedArgs.commitMessage,
                    pointsCompleted: 0, //TODO
                    happyWithWork: constructedArgs.happyMeter
                };
            }).catch( (err) => {
                console.log(err);
                process.exit();
            });
    }

    this.dao.commitSprint(sprintId, {...sprint, sprintTasks: mappedSprintTasks});
}

SprintCommand.prototype.removeTask = function(args) {
    var _ = require('underscore');

    if (_.isUndefined(args.taskId) ) {
        console.log('Please specify --taskId flag');
        process.exit();
    }
    this.dao.removeTaskFromSprint(args.taskId);
}

async function processNewSprint(args) {

    if (args.i) { //Flag for interactive sprint creation...
        const argPromptArr = [
            {argKey: 'name', prompt: 'What is the name of this sprint?: ', value: null},
            {argKey: 'sprintBeginDate', prompt: 'When does this sprint begin? (YYYY-MM-DD): ', value: null},
            {argKey: 'sprintEndDate', prompt: 'When does this sprint end? (YYYY-MM-DD): ', value: null}
        ];

        await this.util.constructArgsInteractively(argPromptArr)
            .then( (constructedArgs) => args = constructedArgs)
            .catch( (err) => {
                console.log(err);
                process.exit();
            });
    }

    validateSprintInput(args);
    require('../dao').createSprint(buildSprintModel(args));
}

function validateSprintInput(args) {
    if ( !args.name && !args.n ) {
        throw 'Please supply --name argument';
    }

    if ( !args.sprintBeginDate && !args.b) {
        throw 'Please supply --sprint-begin-date argument';
    } else if (! moment(argValue(args.sprintBeginDate,args.b)).isValid()) {
        throw 'Please enter a valid --sprint-begin-date argument.';
    }

    if ( !args.sprintEndDate && !args.e) {
        throw 'Please supply --sprint-end-date argument';
    } else if (! moment(argValue(args.sprintEndDate,args.e)).isValid()) {
        throw 'Please enter a valid --sprint-end-date argument.';
    }
}

function buildSprintModel(args) {
    const name            = argValue(args.name, args.n);
    const creationDate    = moment();
    const sprintBeginDate = moment(argValue(args.sprintBeginDate,args.b)).add(7, 'hours');
    const sprintEndDate   = moment(argValue(args.sprintEndDate,args.e)).add(7, 'hours');

    const SprintModelBuilder = require('../builders/sprint-model-builder');

    return SprintModelBuilder.build(
            name,
            sprintBeginDate,
            sprintEndDate
    );
}

function argValue(obj1, obj2) {
    return (obj1) ? obj1 : obj2;
}

module.exports = SprintCommand;
