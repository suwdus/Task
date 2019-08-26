exports.configPath = function() {
  return `${process.env.HOME}/.task/config.json`;
}

exports.SubCommandMap =
{
  'list': './commands/ls',
  'calendar': './commands/cal',
  'add': './commands/add',
  'update': './commands/update',
  'delete': './commands/del',
  'clear': './commands/clear',

  //Short command mappings...
  'cal': './commands/cal',
  'ls' : './commands/ls',
  'a': './commands/add',
  'u': './commands/update',
  'd': './commands/del',


}
