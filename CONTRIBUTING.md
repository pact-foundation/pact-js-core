# Contributing

## Key Branches

* `master` - this is the current main version supporting the 10.x.x release line of Pact JS. Most investment will be here, inclruding major new features, enhancements, bug fixes, security patches etc.
* `pact-node` - this is the previous major version supporting the 9.x.x release line of Pact JS. Critical security patches and bug fixes will be provided as a priority.
* 
## Raising issues

Before raising an issue, make sure you have checked the open and closed issues to see if an answer is provided there.
There may also be an answer to your question on [stackoverflow].

Please provide the following information with your issue to enable us to respond as quickly as possible.

* The relevant versions of the packages you are using.
* The steps to recreate your issue.
* An executable code example where possible. You can fork this repository and use one of the [examples] to quickly recreate your issue.

## I want to contribute code but don't know where to start

If you're not sure where to start, look for the [help wanted](https://github.com/pact-foundation/pact-core/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
label in our issue tracker. If you have an idea that you think would be great, come and chat to us on [slack] in the `#pact-js` channel, or open a feature request issue.

## I'm ready to contribute code

Awesome! We have some guidelines here that will help your PR be accepted:

### Commit messages

Pact Node uses the [Conventional Changelog](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md)
commit message conventions to simplify automation process. Please ensure you follow the guidelines.

You can take a look at the git history (`git log`) to get the gist of it. 
If you have questions, feel free to reach out in `#pact-js` in our [slack
community](https://pact-foundation.slack.com/).

#### Release notes

Commit messages with `fix` or `feat` prefixes will appear in the release notes. 
These communicate changes that users may want to know about.

* `feat(<scope>):` or `feat:` messages appear under "New Features", and trigger minor version bumps.
* `fix(<scope>):` or `fix:` messages appear under "Fixes and improvements", and trigger patch version bumps.

If your commit message introduces a breaking change, please include a footer that starts with `BREAKING CHANGE:`.
For more information, please see the [Conventional Changelog](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md)
guidelines.

(Also, if you are committing breaking changes, you may want to check with the other maintainers on slack first).

Examples of `fix` include bug fixes and dependency bumps that users of pact-js may want to know about.

Examples of `feat` include new features and substantial modifications to existing features.

Examples of things that we'd prefer not to appear in the release notes include documentation updates, 
modified or new examples, refactorings, new tests, etc. We usually use one of `chore`, `style`, 
`refactor`, or `test` as appropriate.

## Pull requests

* Write tests for any changes
* Follow existing code style and conventions
* Separate unrelated changes into multiple pull requests
* For bigger changes, make sure you start a discussion first by creating an issue and explaining the intended change

[stackoverflow]: https://stackoverflow.com/questions/tagged/pact
