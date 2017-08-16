"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var checkTypes = require("check-types");
var PactUtil = (function () {
    function PactUtil() {
    }
    PactUtil.prototype.createArguments = function (args, mappings) {
        return _.chain(args)
            .map(function (value, key) {
            if (value && mappings[key]) {
                return [mappings[key], "'" + (checkTypes.array(value) ? value.join(",") : value) + "'"];
            }
        })
            .flatten()
            .compact()
            .value();
    };
    return PactUtil;
}());
exports.PactUtil = PactUtil;
exports.default = new PactUtil();
//# sourceMappingURL=pact-util.js.map