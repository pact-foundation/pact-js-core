var _ = require('underscore'), checkTypes = require('check-types');
function PactUtil() { }
PactUtil.prototype.createArguments = function (args, mappings) {
    return _.chain(args)
        .map(function (value, key) {
        if (value && mappings[key]) {
            return [mappings[key], '"' + (checkTypes.array(value) ? value.join(',') : value) + '"'];
        }
    })
        .flatten()
        .compact()
        .value();
};
module.exports = new PactUtil();
//# sourceMappingURL=pact-util.js.map