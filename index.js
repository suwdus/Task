/**
 *
 * Description: Entry point into the <task> CLI application.
 *
 * Summary: Allows the user to update and view their tasks.
 *
 *
 * @author Philip M. Turner
 *
 */

const moment                    = require('moment-timezone');
const Util                      = require('./util');
const Dao                       = require('./dao');

const TaskCommand = { util : new Util(), dao: new Dao() };

TaskCommand.run = function() {
  const args = require('minimist')(process.argv.slice(2));
  const subCommand = args._[0];

  switch (subCommand) {
    case 'add':
    case 'a':
      validateAddInput(args);
      /* Determine whether to upload all local tasks to s3 */
      const doS3Upload = argValue(args.upload, args.u);
      this.dao.createTask(createTask(args), doS3Upload);
      break;
    case 'init':
    case 'i':
      validateInitInput(args);
      //TODO: convert args into proper configuration object...
      this.util.initializeApplication(args);
      break;
    case 'list':
    case 'ls':
    case 'l':
      this.tasks = this.dao.getTasks();
      require('./commands/ls').getTaskListTerminalOutput(this.tasks)
      .then((tasksOutput) => {
        console.log(tasksOutput);
      });
      break;
    case 'update': /* Update task with annotation */
    case 'u':
      this.dao.updateTask(args);
      break;
    case 'delete': /* Delete specific task */
    case 'd':
      this.dao.deleteTask(args);
    case 'clear':
      //TODO: Prompt user for confirmation...
      this.dao.clearTasks();
      break;
    case 'cal': /* Print task calendar to the terminal */
    case 'c':
      if (! this.tasks)
        this.tasks = this.dao.getTasks();

      const config = require(APP_CONFIG_PATH);
      const moment = require('moment-timezone');

      taskListOutputPromise = require('./commands/ls')
                .getTaskListTerminalOutput(this.tasks);

      require('./commands/cal').getCalendarTerminalOutput(this.tasks)
      .then((calendarOutput) => {
        taskListOutputPromise.then((taskList) => {
          var out = `Currently in Q${moment().quarter()} ` + `${moment().year().toString()}\n\n` +
                    `${moment().tz(config.timezone).format("ddd, hA")}\n` +
                    `${calendarOutput}\n` +
                    `${taskList}`;
          console.log(out);
        });
      });
      break;
    default:
      console.log("Ueh, you don't know what you want to do..");
  }
}

module.exports = TaskCommand;


/* ======================== Helpers ======================== */

function validateInitInput(args) {
  if ( !args.username && !args.u ) {
    throw 'Please supply -username argument';
  }
}

function validateAddInput(args) {
  if ( !args.title && !args.t ) {
    throw 'Please supply --title argument';
  }

  if ( !args.date && !args.d ) {
    throw 'Please supply --due-date argument';
  } else if (! moment(argValue(args.date,args.d)).isValid()) {
    throw 'Please enter a valid -due-date argument.';
  }
}

function createTask(args) {
  const config = require(APP_CONFIG_PATH);

  return {
    title: argValue(args.title, args.t),
    creationDate: moment(),
    dueDate: moment(argValue(args.dueDate,args.d)),
    completionDate: null,
    project: argValue(args.project, args.p),
    subtasks: [],
    points:0,
    owner:config.name,
    subProjects:null,
    annotations:[],
    isProject:false,
    isActive:false
  }
}

/* Get non-null arg value if it exits. */
function argValue(obj1, obj2) {
  return (obj1) ? obj1 : obj2;
}
