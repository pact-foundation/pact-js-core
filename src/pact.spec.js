/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var expect = require('chai').expect;

describe("Pact Spec", function() {
	var pact;
	beforeEach(function() {
		pact = require('./pact.js');
	});

	afterEach(function() {
		pact.removeAll();
	});

	describe("Create server", function() {
		context("when no options are set", function() {
			it("should use defaults and return server", function() {
				var server = pact.create();
				expect(server).to.be.an('object');
				expect(server).to.contain.all.keys(['port', 'cors', 'ssl', 'host', 'dir', 'log', 'spec', 'consumer', 'provider']);
				expect(server.start).to.be.a('function');
				expect(server.stop).to.be.a('function');
				expect(server.delete).to.be.a('function');
			});
		});
	});

	describe("List servers", function() {

	});

	describe("Remove server", function() {

	});

	describe("Remove all servers", function() {

	});

});
