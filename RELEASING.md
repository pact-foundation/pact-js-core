<img src="https://raw.githubusercontent.com/pact-foundation/pact-logo/master/media/logo-black.png" width="200">

## Publishing via Travis (recommended)

Make your changes in a new branch, when merged into master:

        $ npm run release
        $ # review workspace and commits - if all looks good...
        $ git push --follow-tags

Travis CI will do the rest.

## Releasing Pact Node Manually

If any changes needs to be released, let it be dependencies or code, you must have access to push directly to master on the pact-node repo, then follow these steps:

 - Run `npm test` first to make sure all tests pass, just in case.
 - Update the package.json version number using Semantic Versioning rules:
   - Bug fixes and other minor changes: Patch release, increment the last number, e.g. 1.0.1.
   - New features which don't break existing features: Minor release, increment the middle number, e.g. 1.1.0.
   - Changes which break backwards compatibility: Major release, increment the first number, e.g. 2.0.0.
 - Commit the package.json changes (It should just be the version that changed)
 - Tag the commit with the name number as the version that was just changed using `git tag -a <version> -m "Releasing <insert what's being released>"`
 - Push the commit and the tag to the origin using `git push --follow-tags`
 - Sit back and [watch TravisCI build and release pact-node to npm](https://travis-ci.org/pact-foundation/pact-node).

## Updating Dependencies

If dependencies need to be updated please do so carefully and test everything thoroughly.  For stability sake, do not use `~` or `^` within the package.json file unless it is for a repository that Pact Foundation can control.  _All other dependencies must have an exact version number_.
