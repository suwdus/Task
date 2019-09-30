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

function TaskCommand() {
    const configurator  = require('./config/configurator'),
          configPath    = configurator.configPath(),
          subCommandMap = configurator.userSubCommandMap();

    this.dao = require('./dao/');
    var subCommand = process.argv[2];

    /*********** SETTING APP-SPECIFIC GLOBALS ***********/
    global.APP_CONFIG_PATH = configPath;

    if (subCommand !== 'init') {
        global.config = require(configPath);
    }

    /*********** END OF APP-SPECIFIC GLOBALS ***********/


    if (!subCommand) /* Set default subcommand */
        subCommand = 'sprint';

    //Get/Set mandatory data necessary for all commands besides `init`.
    if (subCommand !== 'init')
        var appData = this.dao.getAppData();

    //Initialize necessary command.
    var SubCommand;
    try {
        SubCommand      = require(subCommandMap[subCommand]);
        this.SubCommand = new SubCommand(appData);
    } catch (err) {
        console.log(`Could not initialize subcommand: ${subCommand}`, err); throw msg;
    }
}

TaskCommand.prototype.run = function() {
    const args = require('minimist')(process.argv.slice(2));
    this.SubCommand.run(args);
}

module.exports = new TaskCommand();
