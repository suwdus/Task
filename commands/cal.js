/**
 *
 * @author Philip M. Turner
 *
 */


/* Prints the user's task calendar to the terminal window. */
module.exports = function(tasks) {
  const chalk         = require('chalk');
  const childProcess  = require('child_process');

  const cal           = childProcess.spawn('cal',['-3']); //TODO: Make calendar months shown configurable.
  const legend        = `Legend: ` +
                          ` ${chalk.blue('today')},` +
                          ` ${chalk.red('due')}, `+
                          ` ${chalk.yellow('due-today')},`+
                          ` ${chalk.bold('overdue')},`+
                          ` weekend,`+
                          ` ${chalk.green('holiday')},`+
                          ` ${chalk.underline('weeknumber')}.`

  var calendarString = '\n';

  cal.stdout.on('data', (calendar) => {

    /*Colorize specific day (Demo purposes only) */
    calendarString += calendar.toString()
                              .replace('23',chalk.blue('23'));

    calendarString += `\n${legend}\n`;
    console.log(calendarString);

  });

  cal.on('error', (error) => {
    console.log('Issue with the child process\n' + error);
  });

}
