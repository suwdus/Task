/**
 *
 * @author Philip M. Turner
 *
 */

function TaskModel(input) {
  for(let [key, val] of Object.entries(input)) {
    this[key] = val;
  }
  this.validate();
}

TaskModel.prototype.validate = function() {
  //TODO: Validate model...
  if (false)
    throw 'Model was invalid';
}

function TaskModelBuilder() {
}

TaskModelBuilder.prototype.build = function (
  title,
  creationDate,
  dueDate,
  complete,
  completionDate,
  parentTaskId,
  project,
  subtasks,
  points,
  owner,
  annotations) {

  return new TaskModel({
    title: title,
    creationDate: creationDate,
    dueDate: dueDate,
    complete: complete,
    completionDate: completionDate,
    parentTaskId : parentTaskId,
    project: project,
    subtasks: subtasks,
    points: points,
    owner: owner,
    annotations: annotations
  });
}

module.exports = new TaskModelBuilder();
