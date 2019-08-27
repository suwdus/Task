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

const Dao           = require('./dao/dao');
const Configurator  = require('./config/configurator');

function TaskCommand() {
  this.dao = new Dao();

  const configurator  = new Configurator();
  const configPath    = configurator.configPath();
  const subCommand    = process.argv[2];

  /*********** SETTING APP-SPECIFIC GLOBALS ***********/
  global.APP_CONFIG_PATH = configPath;

  if (subCommand !== 'init')
    global.config = require(configPath);

  /*********** END OF APP-SPECIFIC GLOBALS ***********/

  const subCommandMap = configurator.userSubCommandMap();

  if (!subCommand) /* Set default subcommand */
    subCommand = 'cal';

  //Get/Set mandatory data necessary for all commands besides `init`.
  var tasks = this.dao.getAppData();

  //Initialize necessary command.
  var SubCommand;
  try {
    SubCommand      = require(subCommandMap[subCommand]);
    this.SubCommand = new SubCommand(tasks);
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
