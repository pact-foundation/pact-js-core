"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var basicAuth = require("basic-auth");
function returnJson(json) {
    return function (req, res) { return res.json(json); };
}
exports.returnJson = returnJson;
function returnJsonFile(filename) {
    return returnJson(require(filename));
}
exports.returnJsonFile = returnJsonFile;
function auth(req, res, next) {
    var user = basicAuth(req);
    if (user && user.name === 'foo' && user.pass === 'bar') {
        next();
    }
    else {
        res
            .set('WWW-Authenticate', 'Basic realm=Authorization Required')
            .sendStatus(401);
    }
    return res;
}
exports.auth = auth;
//# sourceMappingURL=data-utils.js.map