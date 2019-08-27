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

const Dao = require('./dao/dao');

function TaskCommand() {
  this.dao  = new Dao();

  /*********** SETTING APP-SPECIFIC GLOBALS ***********/

  const configPath        = require('./config/config').configPath();
  const subCommandMap     = require('./config/config').SubCommandMap;
  var subCommand          = process.argv[2];
  global.APP_CONFIG_PATH  = configPath;

  if (!subCommand) /* Set default subcommand */
    subCommand = 'cal';

  if (subCommand !== 'init') {
    global.config = require(configPath);
  }

  /*********** END OF APP-SPECIFIC GLOBALS ***********/

  //Get/Set mandatory data necessary for all commands besides `init`.
  var tasks = this.dao.getAppData();

  //Initialize necessary command.
  var SubCommand;
  try {
    SubCommand        = require(subCommandMap[subCommand]);
    this.SubCommand   = new SubCommand(tasks);
  } catch (err) {
    var msg = `Could not initialize subcommand: ${subCommand}`;
    console.log(msg, err); throw msg;
  }
}

TaskCommand.prototype.run = function() {
  const args = require('minimist')(process.argv.slice(2));
  this.SubCommand.run(args);

}

module.exports = new TaskCommand();
