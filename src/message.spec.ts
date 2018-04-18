import chai = require("chai");
import path = require("path");
import chaiAsPromised = require("chai-as-promised");
import fs = require("fs");
import messageFactory from "./message";

const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const expect = chai.expect;
chai.use(chaiAsPromised);

describe("Message Spec", () => {
	const validJSON = `{ "description": "a test mesage", "content": { "name": "Mary" } }`;

	let absolutePath: string;
	let relativePath: string;
	beforeEach(() => {
		relativePath = `.tmp/${Math.floor(Math.random() * 1000)}`;
		absolutePath = path.resolve(__dirname, "..", relativePath);
		mkdirp.sync(absolutePath);
	});

	afterEach(() => {
		if (fs.existsSync(absolutePath)) {
			rimraf.sync(absolutePath);
		}
	});

	context("when invalid options are set", () => {
		it("should throw an Error when not given any message content", () => {
			expect(() => messageFactory({
				consumer: "a-consumer",
				dir: absolutePath
			})).to.throw(Error);
		});

		it("should throw an Error when not given a consumer", () => {
			expect(() => messageFactory({
				provider: "a-provider",
				dir: absolutePath,
				content: validJSON
			})).to.throw(Error);
		});

		it("should throw an Error when not given a provider", () => {
			expect(() => messageFactory({
				consumer: "a-provider",
				dir: absolutePath,
				content: validJSON
			})).to.throw(Error);
		});

		it("should throw an Error when given an invalid JSON document", () => {
			expect(() => messageFactory({
				consumer: "some-consumer",
				provider: "a-provider",
				dir: absolutePath,
				content: `{ "unparseable" }`
			})).to.throw(Error);
		});

		it("should throw an Error when not given a pact dir", () => {
			expect(() => messageFactory({
				consumer: "a-consumer",
				content: validJSON
			})).to.throw(Error);
		});
	});

	context("when valid options are set", () => {
		it("should return a message object when given the correct arguments", () => {
			const message = messageFactory({
				consumer: "some-consumer",
				provider: "a-provider",
				dir: absolutePath,
				content: validJSON
			});
			expect(message).to.be.a("object");
			expect(message).to.respondTo("createMessage");
		});

		it("should return a promise when calling createMessage", () => {
			const promise = messageFactory({
				consumer: "some-consumer",
				provider: "a-provider",
				dir: absolutePath,
				content: validJSON
			}).createMessage();
			expect(promise).to.ok;
			return expect(promise).to.eventually.be.fulfilled;
		});

		it("should create a new directory if the directory specified doesn't exist yet", () => {
			const dir = path.resolve(absolutePath, "create");
			return messageFactory({
				consumer: "some-consumer",
				provider: "a-provider",
				dir: dir,
				content: validJSON
			})
				.createMessage()
				.then(() => expect(fs.existsSync(dir)).to.be.true);
		});

		it("should return an absolute path when a relative one is given", () => {
			const dir = path.join(relativePath, "create");
			expect(messageFactory({
				consumer: "some-consumer",
				provider: "a-provider",
				dir: dir,
				content: validJSON
			}).options.dir).to.equal(path.resolve(__dirname, "..", dir));
		});

		it("should create a new directory with a relative path", () => {
			const dir = path.join(relativePath, "create");
			return messageFactory({
				consumer: "some-consumer",
				provider: "a-provider",
				dir: dir,
				content: validJSON
			})
				.createMessage()
				.then(() => expect(fs.existsSync(path.resolve(__dirname, "..", dir))).to.be.true);
		});
	});
});
