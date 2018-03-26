import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import messageFactory from "./message";
const path = require("path");
const expect = chai.expect;
chai.use(chaiAsPromised);

describe("Message Spec", () => {
	const currentDir = (process && process.mainModule) ? path.dirname(process.mainModule.filename) : "";
	const validJSON = `{ "description": "a test mesage", "content": { "name": "Mary" } }`;

	context("when not given any message content", () => {
		it("should throw an Error", () => {
			expect(() => messageFactory({
				consumer: "a-consumer",
				dir: currentDir
			})).to.throw(Error);
		});
	});

	context("when not given a consumer", () => {
		it("should throw an Error", () => {
			expect(() => messageFactory({
				provider: "a-provider",
				dir: currentDir,
				content: validJSON
			})).to.throw(Error);
		});
	});
	context("when not given a provider", () => {
		it("should throw an Error", () => {
			expect(() => messageFactory({
				consumer: "a-provider",
				dir: currentDir,
				content: validJSON
			})).to.throw(Error);
		});
	});

	context("when not given a pact dir", () => {
		it("should throw an Error", () => {
			expect(() => messageFactory({
				consumer: "a-consumer",
				content: validJSON
			})).to.throw(Error);
		});
	});

	context("when given an invalid JSON document", () => {
		it("should throw an Error", () => {
			expect(() => messageFactory({
				consumer: "some-consumer",
				provider: "a-provider",
				dir: currentDir,
				content: `{ "unparseable" }`
			})).to.throw(Error);
		});
	});

	context("when given the correct arguments", () => {
		it("should return a message object", () => {
			const message = messageFactory({
				consumer: "some-consumer",
				provider: "a-provider",
				dir: currentDir,
				content: validJSON
			});
			expect(message).to.be.a("object");
			expect(message).to.respondTo("createMessage");
		});
	});
});
