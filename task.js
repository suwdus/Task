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

const Dao = require('./dao');

function TaskCommand() {
  this.dao  = new Dao();

  /*********** SETTING APP-SPECIFIC GLOBALS ***********/

  const configPath        = require('./config').configPath();
  const subCommandMap     = require('./config').SubCommandMap;
  const subCommand        = process.argv[2];
  global.APP_CONFIG_PATH  = configPath;

  if (subCommand != 'init') {
    global.config = require(configPath);
  }

  /*********** END OF APP-SPECIFIC GLOBALS ***********/

  //Get/Set mandatory data necessary for all commands besides `init`.
  var tasks = this.dao.getAppData();

  //Initialize necessary command.
  var SubCommand;
  try {
    SubCommand = require(subCommandMap[subCommand]);
    this.SubCommand   = new SubCommand(tasks);
  } catch (err) {
    throw `Could not initialize subcommand: ${subCommand}`;
  }
}

TaskCommand.prototype.run = function() {
  const args = require('minimist')(process.argv.slice(2));
  this.SubCommand.run(args);

}

module.exports = new TaskCommand();
