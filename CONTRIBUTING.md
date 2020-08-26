# Contributing

## Raising issues

Before raising an issue, make sure you have checked the open and closed issues to see if an answer is provided there.
There may also be an answer to your question on [stackoverflow].

Please provide the following information with your issue to enable us to respond as quickly as possible.

* The relevant versions of the packages you are using.
* The steps to recreate your issue.
* An executable code example where possible. You can fork this repository and use one of the [examples] to quickly recreate your issue.

### Commit messages

Pact Node uses the [Conventional Changelog](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md)
commit message conventions to simplify automation process. Please ensure you follow the guidelines.

Should your change include something that should be listed in the release
notes, please use `feat` or `fix` commits with a good commit message. Your
commit message will automatically be included in the release notes.

If you are committing something that shouldn't be listed in the release
notes, please use a different type (even if it is technically a fix). We
usually use one of `chore`, `style`, `refactor`, or `test` as appropriate.

You can take a look at the git history (`git log`) to get the gist of it. 
If you have questions, feel free to reach out in `#pact-node` in our [slack
community](https://pact-foundation.slack.com/).


## Pull requests

* Write tests for any changes
* Follow existing code style and conventions
* Separate unrelated changes into multiple pull requests
* For bigger changes, make sure you start a discussion first by creating an issue and explaining the intended change

[stackoverflow]: https://stackoverflow.com/questions/tagged/pact
