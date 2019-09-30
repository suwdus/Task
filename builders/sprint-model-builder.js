/**
 *
 * @author Philip M. Turner
 *
 */

function SprintModel(input) {
    for(let [key, val] of Object.entries(input)) {
        this[key] = val;
    }
    this.sprintTasks = {};
    this.validate();
}

SprintModel.prototype.validate = function() {
    //TODO: Validate model...
    if (false)
        throw 'Model was invalid';
}

function SprintModelBuilder() {
}

SprintModelBuilder.prototype.build = function (
    name,
    sprintBeginDate,
    sprintEndDate) {

    return new SprintModel({
        name: name,
        sprintBeginDate: sprintBeginDate,
        sprintEndDate: sprintEndDate
    });
}

module.exports = new SprintModelBuilder();
