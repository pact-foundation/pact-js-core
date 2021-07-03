# Pact-core migration guide

This guide is for migrating code that calls Pact-Core to a new version. 
If you are a user of pact rather than a maintainer of tools for pact, you
probably want to be using https://github.com/pact-foundation/pact-js directly
instead of pact-core. There is a corresponding migration guide there.

# v12.x.x from v11.x.x

## Verifier

* Remove `verbose`. This option has been removed, as it is now implied by `logLevel` 
  of `DEBUG` or `TRACE`.
* `customProviderHeaders` has been removed. If you need this functionality, use an 
  appropriate request filter with `requestFilters` instead.
* Remove `logDir` / `format` / `out` options, as they are no longer supported.

### Changes you may want to know about:

* All logging and reporting is now on standard out. This was the default before. If 
  your ecosystem needs the ability to customise logging and reporting, please let us
  know by opening an issue.
* The undocumented option `monkeypatch` has been removed. The use cases for this feature are mostly covered by other options.

# v11.x.x. from v10.x.x and below

* Update any calls that recieves a `q.Promise` to simply accept a native ES `Promise`.
* In `VerifierOptions`: replace use of `tags`, `consumerVersionTag` and
  `providerVersionTag` with the appropriate `consumerVersionTags` or
  `providerVersionTags` option.

# v10.12.0 (first version as `pact-core`)

* `@pact-foundation/pact-node` has been renamed to `@pact-foundation/pact-core`.
  This better describes what it is for, and will hopefully reduce confusion. See
  [this issue](https://github.com/pact-foundation/pact-js-core/issues/224) for
  background.