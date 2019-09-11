/**
 *
 * @author Philip M. Turner
 *
 * Logic object assembler.
 *
 */

function AppData(data) { //TODO

  this.currentSprintId = data.currentSprintId;
  this.projects        = data.projects;
  this.sprints         = data.sprints;
  this.tasks           = data.tasks;

}

module.exports = AppData;
