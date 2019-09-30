/**
 *
 * @author Philip M. Turner
 *
 */

function SprintTaskModel(input) {
    for(let [key, val] of Object.entries(input)) {
        this[key] = val;
    }
    //Add additional task metadata...
    this.dateAddedToSprint = require('moment')();
    this.isFromPriorSprint = false;
    this.validate();
}

SprintTaskModel.prototype.validate = function() {
    //TODO: Validate model...
    if (false)
        throw 'Model was invalid';
}

function SprintTaskModelBuilder() {
}

SprintTaskModelBuilder.prototype.build = function (taskId) {

    return new SprintTaskModel({
        taskId : taskId
    });
}

module.exports = new SprintTaskModelBuilder();
