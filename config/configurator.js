/**
 *
 * Configurator for Task.
 *
 * @author Philip M. Turner
 *
 */

function Configurator() {}

Configurator.prototype.configPath = function() {
  return `${process.env.HOME}/.task/config.json`;
}

Configurator.prototype.userSubCommandMap = function() {

  /*
   * Note: Some subcommands will not be available
   * to users specified by admin in the future.
   */

  const subCommandMap =
  {
    'list': './commands/ls',
    'calendar': './commands/cal',
    'add': './commands/add',
    'update': './commands/update',
    'upload': './commands/upload',
    'delete': './commands/del',
    'clear': './commands/clear',
    'sprint': './commands/sprint',
    'init': './commands/init',

    /* Short command mappings */
    'cal': './commands/cal',
    'ls' : './commands/ls',
    'a': './commands/add',
    'u': './commands/update',
    'd': './commands/del',
  }

  return subCommandMap;
}

module.exports = Configurator;
