/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var serverFactory = require('./server.js'),
    expect = require('chai').expect;

describe("Server Spec", function () {
    var server;

    beforeEach(function () {
        server = serverFactory();
    });

    afterEach(function (done) {
        server.delete().then(function () {
            done();
        })
    });

    describe("Start server", function () {
        context("when options are correct", function () {
            it("should start correctly", function (done) {
                server.start().then(function () {
                    done();
                });
            });
        });
    });

    describe("Stop server", function () {
        context("when already started", function () {
            it("should stop running", function (done) {
                server.start().then(function () {
                    return server.stop();
                }).then(function () {
                    done();
                });
            });
        });
    });

    describe("Delete server", function () {
        context("when already running", function () {
            it("should stop & delete server", function () {
                server.start().then(function () {
                    return server.delete();
                }).then(function () {
                    done();
                });
            });
        });
    });

});
