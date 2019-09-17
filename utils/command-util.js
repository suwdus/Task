/**
 *
 * Helper Object for Commands
 *
 * @author Philip M. Turner
 *
 */

function CommandUtil() {
}

CommandUtil.prototype.constructArgsInteractively = function(args, argPromptArr) {

  return new Promise( (resolve,reject) => {
    var promptIdx = 0;

    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: argPromptArr[promptIdx].prompt
    });
    rl.prompt(); /* Prompt the user with the first prompt in the list */

    rl.on('line', (line) => {
      /* Set the argument value based on user input */
      argPromptArr[promptIdx++].value = getValueFromPrompt(line);
      if (promptIdx === argPromptArr.length)
        rl.close();
      else {
        rl.setPrompt(argPromptArr[promptIdx].prompt);
        rl.prompt(); /* Prompt the user for next bit of input */
      }
    });

    rl.on('close', () => {
      argPromptArr.forEach( (argKeyValPair) => {
        const key = argKeyValPair.argKey;
        const val = argKeyValPair.value;
        /* Set arg values based on interactive session */
        args[key] = val;
      });
      resolve(args);
    });

    rl.on('SIGINT', () => {
      rl.pause();
      reject('Signal interrupted, aborting.');
    });
  }).catch( (err) => {
    console.log(err);
    process.exit();
  });
}

function getValueFromPrompt(val) {
  switch (val) {
    case '':
    case 'false':
    case 'n':
      return false;
    case 'y':
      return true;
    default:
      //Try to parse value as an int...
      if (val.match(/^(\-)?[0-9]+$/))
        return Number.parseInt(val)
      return val;
  }
}

module.exports = new CommandUtil();
