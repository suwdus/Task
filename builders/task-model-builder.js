/**
 *
 * @author Philip M. Turner
 *
 */

/* TODO: Builder should perform validations */
TaskModelBuilder.build = function (
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

    return {
        title: title, //Validate
        creationDate: creationDate, //Validate
        dueDate: dueDate, //Validate
        complete: complete, //Validate...
        completionDate: completionDate,
        parentTaskId : parentTaskId,
        project: project,
        subtasks: subtasks,
        points: points,
        owner: owner,
        annotations: annotations
    };
}

module.exports = TaskModelBuilder;
