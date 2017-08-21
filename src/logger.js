"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var bunyan = require("bunyan");
var PrettyStream = require("bunyan-prettystream");
var pkg = require("../package.json");
var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);
var Logger = (function (_super) {
    __extends(Logger, _super);
    function Logger() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Logger.prototype.time = function (action, startTime) {
        var time = Date.now() - startTime;
        this.info({
            duration: time,
            action: action,
            type: "TIMER"
        }, "TIMER: " + action + " completed in " + time + " milliseconds");
    };
    Object.defineProperty(Logger.prototype, "logLevelName", {
        get: function () {
            return bunyan.nameFromLevel[this.level()];
        },
        enumerable: true,
        configurable: true
    });
    return Logger;
}(bunyan));
exports.Logger = Logger;
exports.default = new Logger({
    name: "search-api@" + pkg.version,
    streams: [{
            level: (process.env.LOGLEVEL || "info"),
            stream: prettyStdOut,
            type: "raw"
        }]
});
//# sourceMappingURL=logger.js.map