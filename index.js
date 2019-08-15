module.exports = () => {
  const minimist = require('minimist')
  const s3 = require('aws-sdk');

  const args = minimist(process.argv.slice(2))
  const subCommand = args._[0];

  switch (subCommand) {
    case "add":
      addTask(args);
      break;
    case 'list':
      //TODO: Add list capability.
    case 'update':
      //TODO: Add update capability.
    case 'delete':
      //TODO: Add delete capability.
    default:
      console.log("Ueh, you don't know what you want to do..");
  }

}

/*
 * ============================ Add Task API ============================
 * task add -t <title> -d <due date> ? -p <project_name>
 *
 * Mandatory Parameters:
 * -t, title. Short task title.
 * -d, due date. Many formats accepted.
*/
function addTask(args) {
  verifyAddTaskInput(args);
  const task = {};
  var createdDate = new Date().getTime();

  task.title = (args.title ? args.title : null);
  task.dueDate = (args.dueDate ? args.dueDate : null);
  task.createdDate = createdDate;

  //TODO: Implement callback for once object has been loaded to S3.
  //Should update the file stored locally.

  /*
   * saveToS3(task).then( (err, res) => {
   *  saveToDisk(task);
   * });
  */
}

//TODO: Implement function for uploading data to S3. Should return a promise.
function saveToS3(object) {
  /**
   * 1. Read the current task array in from `~/.task/task`.
   * 2. Append the current task to the array.
   * 3. Use lib to upload JSON to S3.
   * 4. Write file from S3 or modified task array to disk at `~/.task/tasks`.
   */
}

//TODO: Verify parameters. Use moment package to parse the date string.
function verifyAddTaskInput(args) {
}
