/**
 *
 * @author Philip M. Turner
 *
 */


/* task add|a */

const moment = require('moment-timezone');

function AddCommand(appData) {
    this.appData = appData;
    this.dao     = require('../dao/');
    this.util    = require('../utils/command-util');
    this.calendarUtil = require('../utils/calendar-util');
}

AddCommand.prototype.run = async function (args) {
    const _ = require('underscore');

    if (args.i) { //Flag for interactive task creation...
        const argPromptArr = [
            {argKey: 'title', argKeyShort: 't',  prompt: 'What is the title of your task?: ', value: null},
            {argKey: 'dueDate', argKeyShort: 'd',  prompt: 'When is this task due? (YYYY-MM-DD): ', value: null},
            {argKey: 'points', prompt: 'How many points does this task require?: ', value: 0},
            {argKey: 'shouldRelateParent', prompt: 'Would you like to relate this to a parent task? (y/n): ', value: false}
        ].filter( argPrompt => _.isUndefined(args[argPrompt.argKey]) && _.isUndefined(args[argPrompt.argKeyShort]));

        await this.util.constructArgsInteractively(argPromptArr)
            .then( (constructedArgs) => args = {
                ...args,
                ...constructedArgs
            });

    } else if (! args.project) {
        args.project = false; /* Default project to false */
    }

    if (args.shouldRelateParent) { /* User would like to relate this task to a parent task... */
        const relateParentPrompt = [
            {argKey: 'parentTaskId', prompt: 'What is the id of the parent task?: ', value: null}
        ];
        printProjects();
        await this.util.constructArgsInteractively(relateParentPrompt)
            .then( (constructedArgs) => args = {
                ...args,
                ...constructedArgs
            });
    }

    validateAddInput(args);
    const doS3Upload = argValue(args.upload, args.u);

    this.dao.createTask(buildTaskModel(args), doS3Upload);

    const calendarTasks = require('../dao').getAllTasks();

    await this.calendarUtil.getCalendarView(calendarTasks)
    .then((calendarOutput) =>    {
        console.log(calendarOutput);
    });

}

function printProjects() {
    const appData = require('../dao').getAppData();
    appData.projects.forEach((projectId) => {
        const project = appData.tasks[projectId];
        console.log(`${project.title} (${project.id})`);
    });
}


function validateAddInput(args) {
    if ( !args.title && !args.t ) {
        throw 'Please supply --title argument';
    }

    if ( !args.dueDate && !args.d ) {
        throw 'Please supply --due-date argument';
    } else if (! moment(argValue(args.dueDate,args.d)).isValid()) {
        throw 'Please enter a valid -due-date argument.';
    }
}

function buildTaskModel(args) {
    const title            = argValue(args.title, args.t),
          creationDate     = moment(),
          complete         = false,
          completionDate   = null,
          /* TODO: Add N hours to time for date GMT to timezone date conversion.
          * If hours are included in dueDate arg do not manipulate the time.
          */
          dueDate          = moment(argValue(args.dueDate,args.d)).add(7, 'hours'),
          project          = args.project,
          parentTaskId     = argValue(args.parentTaskId, args.P),
          subtasks         = [],
          points           = Number.parseInt(args.points),
          owner            = (args.owner) ? args.owner : config.name,
          annotations      = [],
          TaskModelBuilder = require('../builders/task-model-builder');

    return TaskModelBuilder.build(
            title,
            creationDate,
            dueDate,
            complete,
            completionDate,
            parentTaskId,
            project,
            subtasks,
            points,
            owner,
            annotations
    );
}

function argValue(obj1, obj2) {
    return (obj1) ? obj1 : obj2;
}

module.exports = AddCommand;
