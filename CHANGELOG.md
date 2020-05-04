# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [10.9.4](https://github.com/pact-foundation/pact-node/compare/v10.9.3...v10.9.4) (2020-05-04)


### Bug Fixes

* **options:** Stop validating values for logLevel, pactFileWriteMode and format. This means we'll immediately pick up changes to those options without needing to modify pact-node ([1319a86](https://github.com/pact-foundation/pact-node/commit/1319a86d87d4ffd60a58146150f62a96f4ef9f35))



## [10.9.3](https://github.com/pact-foundation/pact-node/compare/v10.9.2...v10.9.3) (2020-05-02)


### Bug Fixes

* update standalone to 1.84.0 ([9f2eb16](https://github.com/pact-foundation/pact-node/commit/9f2eb1695cbbf2d910a6691f777aa435ea0f1859))



## [10.9.2](https://github.com/pact-foundation/pact-node/compare/v10.9.1...v10.9.2) (2020-04-22)


### Bug Fixes

* update standalone to 1.83.0 ([0cfefb4](https://github.com/pact-foundation/pact-node/commit/0cfefb42d302615b9eb93f064458912f87222734))



## [10.9.1](https://github.com/pact-foundation/pact-node/compare/v10.9.0...v10.9.1) (2020-04-22)


### Bug Fixes

* consumerVersionSelector -> consumerVersionSelectors ([dab9507](https://github.com/pact-foundation/pact-node/commit/dab9507aae9acf00296933e5e0938e9a07cbbbf9))



# [10.9.0](https://github.com/pact-foundation/pact-node/compare/v10.8.1...v10.9.0) (2020-04-10)


### Bug Fixes

* **standalone:** update standalone to 1.82.3 ([#223](https://github.com/pact-foundation/pact-node/issues/223)) ([70fac35](https://github.com/pact-foundation/pact-node/commit/70fac353007e0ebc7b622415cd66bfe25e9c2d2f))


### Features

* **verifier:** Add support for includeWipPactsSince ([c691162](https://github.com/pact-foundation/pact-node/commit/c6911620695435b5e47c22bc0d526ca559e5a356))
* deprecate consumerVersionTag and providerVersionTag. Fixes [#218](https://github.com/pact-foundation/pact-node/issues/218) ([3e932bd](https://github.com/pact-foundation/pact-node/commit/3e932bd7c80a468a68dff21d7e4457732b5af234))



## [10.8.1](https://github.com/pact-foundation/pact-node/compare/v0.0.7...v10.8.1) (2020-04-08)


### Bug Fixes

* **standalone:** update standalone to 1.82.2 ([#220](https://github.com/pact-foundation/pact-node/issues/220)) ([ea85d0b](https://github.com/pact-foundation/pact-node/commit/ea85d0b96dc3f489cfc335ad0b7331e8de0494a2)), closes [pact-foundation/pact-ruby-standalone#49](https://github.com/pact-foundation/pact-ruby-standalone/issues/49)
* correcting the cafile setup for postinstall download ([a07e882](https://github.com/pact-foundation/pact-node/commit/a07e8824d6b5113cbddb4f1767b29020801de407))



# [10.8.0](https://github.com/pact-foundation/pact-node/compare/v10.7.1...v10.8.0) (2020-03-26)


### Features

* add consumer version selectors and pending pacts to verification ([59ab437](https://github.com/pact-foundation/pact-node/commit/59ab437b1155b26b6e25744a9defd507fd80fc70))



## [10.7.1](https://github.com/pact-foundation/pact-node/compare/v10.7.0...v10.7.1) (2020-03-23)


### Bug Fixes

* **standalone:** Bump version of pact-standalone to 1.82.1 (improved json diff, basic auth config improvements) ([bde0287](https://github.com/pact-foundation/pact-node/commit/bde02875b4fed127b3266917b1d38c51b2173255))



# [10.7.0](https://github.com/pact-foundation/pact-node/compare/v10.6.0...v10.7.0) (2020-03-23)


### Bug Fixes

* **deps:** Update vulnerable dependencies ([3c20366](https://github.com/pact-foundation/pact-node/commit/3c203660e157deb0380535fec870de1500a2da0c))


### Features

* **verifier:** Add verbose option to improve debugging during verification ([3f0a5a3](https://github.com/pact-foundation/pact-node/commit/3f0a5a344b0886423d7995605134430f61b52ae4))



# [10.6.0](https://github.com/pact-foundation/pact-node/compare/v10.5.0...v10.6.0) (2020-03-15)


### Bug Fixes

* remove tests, point directly to npm config settings for ca and StrictSSL ([ae36609](https://github.com/pact-foundation/pact-node/commit/ae366098c268339cebf91bc562a611360f0a68b1))
* set strictSSL on custom downloads from NPM config. Fixes [#211](https://github.com/pact-foundation/pact-node/issues/211) ([d264f0b](https://github.com/pact-foundation/pact-node/commit/d264f0b800209a171b320039e7fa3c2dd621606e))


### Features

* **upgrade:** update standalone to 1.82.0 ([92c3af3](https://github.com/pact-foundation/pact-node/commit/92c3af3bb158544ee921a8d0737197c0dd607ba6))



# [10.5.0](https://github.com/pact-foundation/pact-node/compare/v10.4.0...v10.5.0) (2020-03-02)


### Bug Fixes

* lint errors ([3786e13](https://github.com/pact-foundation/pact-node/commit/3786e1301424efd8abf67480dfe6bca7605c3f20))
* remove decompress dependency as it is highly vulnerable. Fixes [#208](https://github.com/pact-foundation/pact-node/issues/208) ([6956544](https://github.com/pact-foundation/pact-node/commit/69565441d5eebabba4db205b608b850f50646636))
* remove extracted binary folders on clean to avoid false positives ([7e8f76b](https://github.com/pact-foundation/pact-node/commit/7e8f76b59b8b375075971db95b7f48486d54d02e))
* use unzipper for .zip files, tar for tar.gz ([f6d8da0](https://github.com/pact-foundation/pact-node/commit/f6d8da07966a8d262aef5e6f21abafbb1a201e96))


### Features

* **upgrade:** update standalone to 1.81.0 ([21a1564](https://github.com/pact-foundation/pact-node/commit/21a1564110726bd9bdf17b734e18eb1fb08223b4))



# [10.4.0](https://github.com/pact-foundation/pact-node/compare/v10.3.1...v10.4.0) (2020-02-18)


### Features

* **upgrade:** update standalone to 1.80.1 ([1a2f517](https://github.com/pact-foundation/pact-node/commit/1a2f517))



## [10.3.1](https://github.com/pact-foundation/pact-node/compare/v10.3.0...v10.3.1) (2020-02-17)


### Bug Fixes

* missing api_key issue in travis https://travis-ci.community/t/missing-api-key-when-deploying-to-github-releases/5761/13 ([8f503b8](https://github.com/pact-foundation/pact-node/commit/8f503b8))



# [10.3.0](https://github.com/pact-foundation/pact-node/compare/v10.2.4...v10.3.0) (2020-02-14)


### Features

* add validation to broker token usage to avoid confusion ([2a4afa3](https://github.com/pact-foundation/pact-node/commit/2a4afa3))
* **upgrade:** update standalone to 1.79.0 ([f33cbb8](https://github.com/pact-foundation/pact-node/commit/f33cbb8))



## [10.2.4](https://github.com/pact-foundation/pact-node/compare/v10.2.3...v10.2.4) (2019-12-17)


### Bug Fixes

* **standalone:** Bump version of pact-standalone to 1.73.0; fixes [#183](https://github.com/pact-foundation/pact-node/issues/183) ([41bafad](https://github.com/pact-foundation/pact-node/commit/41bafad))



## [10.2.3](https://github.com/pact-foundation/pact-node/compare/v10.2.2...v10.2.3) (2019-12-11)


### Bug Fixes

* **spawn:** Improve debug log formatting ([977a845](https://github.com/pact-foundation/pact-node/commit/977a845))
* **spawn:** Now binaries are spawned directly with array arguments, rather than quoted strings. Should fix [#118](https://github.com/pact-foundation/pact-node/issues/118) ([378f256](https://github.com/pact-foundation/pact-node/commit/378f256))



## [10.2.2](https://github.com/pact-foundation/pact-node/compare/v10.2.1...v10.2.2) (2019-11-15)



## [10.2.1](https://github.com/pact-foundation/pact-node/compare/v10.2.0...v10.2.1) (2019-11-10)



# [10.2.0](https://github.com/pact-foundation/pact-node/compare/v10.0.1...v10.2.0) (2019-11-08)


### Features

* add provider version tag during verification ([68b17d8](https://github.com/pact-foundation/pact-node/commit/68b17d8))



# [10.1.0](https://github.com/pact-foundation/pact-node/compare/v10.0.1...v10.1.0) (2019-11-08)


### Features

* add provider version tag during verification ([68b17d8](https://github.com/pact-foundation/pact-node/commit/68b17d8))



## [10.0.1](https://github.com/pact-foundation/pact-node/compare/v10.0.0...v10.0.1) (2019-10-28)


### Bug Fixes

* **install:** Correctly skip downloading the binary archive if it already exists ([1c9a809](https://github.com/pact-foundation/pact-node/commit/1c9a809))
* **install:** Fail installation if binary was not successfully downloaded ([3dfb033](https://github.com/pact-foundation/pact-node/commit/3dfb033))
* **spawn:** The command used to spawn the binary is now debug rather than info (fixes [#184](https://github.com/pact-foundation/pact-node/issues/184)) ([a9f1470](https://github.com/pact-foundation/pact-node/commit/a9f1470))



# [10.0.0](https://github.com/pact-foundation/pact-node/compare/v9.0.7...v10.0.0) (2019-10-28)


### Features

* **can-i-deploy:** Add custom error type CannotDeployError for when the deploy check fails ([635b449](https://github.com/pact-foundation/pact-node/commit/635b449))
* **can-i-deploy:** allow multiple pacticipants to be specified to CanDeploy ([b4b3921](https://github.com/pact-foundation/pact-node/commit/b4b3921))
* **canDeploy:** resolve with output on success ([d20744e](https://github.com/pact-foundation/pact-node/commit/d20744e))
* **CanDeploy:** Set json output as the default for CanDeploy ([200abe7](https://github.com/pact-foundation/pact-node/commit/200abe7))


### BREAKING CHANGES

* **can-i-deploy:** Options for CanDeploy have changed. Now, pacticipants are specified by an array of { name: <string>, latest?: <string | boolean>, version?: <string> }, allowing more than one pacticipant to be specified. You must specify one of latest
or version. If latest is `true`, the latest pact is used. If it is string, then the latest pact with that tag is used.
* **CanDeploy:** CanDeploy now defaults to json output (and returns the parsed object as the result of the promise. If you were using CanDeploy and relied on parsing the logged output, you will need to explicitly set `output: table` in your CanDeploy options.



## [9.0.7](https://github.com/pact-foundation/pact-node/compare/v9.0.6...v9.0.7) (2019-10-23)


### Bug Fixes

* **package.json:** Move snyk to devDependencies ([#193](https://github.com/pact-foundation/pact-node/issues/193)) ([b3d7a8a](https://github.com/pact-foundation/pact-node/commit/b3d7a8a))



## [9.0.6](https://github.com/pact-foundation/pact-node/compare/v9.0.5...v9.0.6) (2019-10-10)


### Bug Fixes

* **verifier:** allow to use progress formatter during verification ([#189](https://github.com/pact-foundation/pact-node/issues/189)) ([2571725](https://github.com/pact-foundation/pact-node/commit/2571725))
* package.json, package-lock.json & .snyk to reduce vulnerabilities ([0dc7a8f](https://github.com/pact-foundation/pact-node/commit/0dc7a8f))



## [9.0.5](https://github.com/pact-foundation/pact-node/compare/v9.0.4...v9.0.5) (2019-10-08)


### Bug Fixes

* upgrade vulnerable dependencies ([e79f929](https://github.com/pact-foundation/pact-node/commit/e79f929))



## [9.0.4](https://github.com/pact-foundation/pact-node/compare/v9.0.3...v9.0.4) (2019-09-11)


### Bug Fixes

* **logging:** print options in json instead of using a helper ([9f09348](https://github.com/pact-foundation/pact-node/commit/9f09348))



## [9.0.3](https://github.com/pact-foundation/pact-node/compare/v9.0.2...v9.0.3) (2019-09-05)


### Bug Fixes

* Upgrade pact-standalone version to v1.70.2 ([3f0f1fc](https://github.com/pact-foundation/pact-node/commit/3f0f1fc))



## [9.0.2](https://github.com/pact-foundation/pact-node/compare/v9.0.1...v9.0.2) (2019-08-06)


### Bug Fixes

* Correct typo in verifier options mapping ([810bd77](https://github.com/pact-foundation/pact-node/commit/810bd77))
* **logging:** Print args for spawn binary correctly in debug output ([2b0ce9d](https://github.com/pact-foundation/pact-node/commit/2b0ce9d))



## [9.0.1](https://github.com/pact-foundation/pact-node/compare/v9.0.0...v9.0.1) (2019-08-05)


### Bug Fixes

* **server:** Maintain a private reference to the global `setTimeout` function in case that function is mocked in a consumer test (e.g. `sinon.useFakeTimers()`) ([#110](https://github.com/pact-foundation/pact-node/issues/110)) ([f4ebfff](https://github.com/pact-foundation/pact-node/commit/f4ebfff))



# [9.0.0](https://github.com/pact-foundation/pact-node/compare/v8.6.2...v9.0.0) (2019-07-16)


### Bug Fixes

* .snyk, package.json & package-lock.json to reduce vulnerabilities ([31e34a1](https://github.com/pact-foundation/pact-node/commit/31e34a1))
* prevent archive extracting as the wrong user when installling as root ([d0941b0](https://github.com/pact-foundation/pact-node/commit/d0941b0))


### Features

* introduce pact binary, and remove pact-cli (BREAKING CHANGE) ([884ce24](https://github.com/pact-foundation/pact-node/commit/884ce24))



## [8.6.2](https://github.com/pact-foundation/pact-node/compare/v8.6.0...v8.6.2) (2019-07-03)


### Bug Fixes

* **standalone:** Update pact-standalone version to obtain fix for https://github.com/pact-foundation/pact_broker-client/issues/50 ([e0a1921](https://github.com/pact-foundation/pact-node/commit/e0a1921))



## [8.6.1](https://github.com/pact-foundation/pact-node/compare/v8.6.0...v8.6.1) (2019-06-28)


### Bug Fixes

* **standalone:** Update pact-standalone version to obtain fix for https://github.com/pact-foundation/pact_broker-client/issues/50 ([e0a1921](https://github.com/pact-foundation/pact-node/commit/e0a1921))



# [8.6.0](https://github.com/pact-foundation/pact-node/compare/v8.5.1...v8.6.0) (2019-06-18)


### Features

* **verifier:** update to latest verifier ([9f328db](https://github.com/pact-foundation/pact-node/commit/9f328db))



## [8.5.1](https://github.com/pact-foundation/pact-node/compare/v8.5.0...v8.5.1) (2019-06-15)


### Bug Fixes

* **verifier:** --monkeypatch flag missing ([b1355bd](https://github.com/pact-foundation/pact-node/commit/b1355bd))



# [8.5.0](https://github.com/pact-foundation/pact-node/compare/v8.4.1...v8.5.0) (2019-06-12)


### Features

* **verifier:** update to latest verifier ([da3d1e3](https://github.com/pact-foundation/pact-node/commit/da3d1e3))



## [8.4.1](https://github.com/pact-foundation/pact-node/compare/v8.4.0...v8.4.1) (2019-06-06)


### Bug Fixes

* **cli:** propagate exit code in node CLI wrapper ([b961b79](https://github.com/pact-foundation/pact-node/commit/b961b79))



# [8.4.0](https://github.com/pact-foundation/pact-node/compare/v8.3.3...v8.4.0) (2019-05-30)


### Bug Fixes

* **mock:** fix q resolver in integration mocks ([6de02db](https://github.com/pact-foundation/pact-node/commit/6de02db))


### Features

* **binstubs:** expose pact standalone binaries as alternative CLI ([02f16cc](https://github.com/pact-foundation/pact-node/commit/02f16cc))
* **binstubs:** expose pact standalone binaries as alternative CLI ([5c164da](https://github.com/pact-foundation/pact-node/commit/5c164da))



## [8.3.3](https://github.com/pact-foundation/pact-node/compare/v8.3.2...v8.3.3) (2019-05-22)



## [8.3.2](https://github.com/pact-foundation/pact-node/compare/v8.3.1...v8.3.2) (2019-05-19)



## [8.3.1](https://github.com/pact-foundation/pact-node/compare/v8.3.0...v8.3.1) (2019-05-16)


### Bug Fixes

* Upgrade Caporal to fix vulnerability (Fixes [#159](https://github.com/pact-foundation/pact-node/issues/159)) ([6efa434](https://github.com/pact-foundation/pact-node/commit/6efa434))



# [8.3.0](https://github.com/pact-foundation/pact-node/compare/v8.2.0...v8.3.0) (2019-05-13)


### Features

* **can-deploy:** add broker token to can-deploy task ([#158](https://github.com/pact-foundation/pact-node/issues/158)) ([fad1e63](https://github.com/pact-foundation/pact-node/commit/fad1e63))



# [8.2.0](https://github.com/pact-foundation/pact-node/compare/v8.1.2...v8.2.0) (2019-04-26)


### Features

* **verifier:** update to latest verifier ([8637cae](https://github.com/pact-foundation/pact-node/commit/8637cae))



## [8.1.2](https://github.com/pact-foundation/pact-node/compare/v8.1.1...v8.1.2) (2019-04-11)


### Bug Fixes

* package.json to reduce vulnerabilities ([#151](https://github.com/pact-foundation/pact-node/issues/151)) ([181e5d8](https://github.com/pact-foundation/pact-node/commit/181e5d8))



## [8.1.1](https://github.com/pact-foundation/pact-node/compare/v8.1.0...v8.1.1) (2019-03-28)


### Bug Fixes

* specify User-Agent when downloading binaries ([a2a1698](https://github.com/pact-foundation/pact-node/commit/a2a1698)), closes [#149](https://github.com/pact-foundation/pact-node/issues/149)



# [8.1.0](https://github.com/pact-foundation/pact-node/compare/v8.0.0...v8.1.0) (2019-03-08)


### Features

* **publish:** add bearer token to publish ([3a411b4](https://github.com/pact-foundation/pact-node/commit/3a411b4))



# [8.0.0](https://github.com/pact-foundation/pact-node/compare/v6.21.4...v8.0.0) (2019-03-07)


### Features

* **verifier:** update to latest verifier ([888209b](https://github.com/pact-foundation/pact-node/commit/888209b))
* **verify:** support broker bearer token ([f060b78](https://github.com/pact-foundation/pact-node/commit/f060b78))


### BREAKING CHANGES

* **verifier:** removal of Broker class



## 7.0.1 (2019-03-06)


### Bug Fixes

* **package:** Update vulnerable packages ([#146](https://github.com/pact-foundation/pact-node/issues/146)) ([e8e5076](https://github.com/pact-foundation/pact-node/commit/e8e5076))



# 7.0.0 (2019-03-04)


### Bug Fixes

* **can-i-deploy:** Fixing can-i-deploy to only have a single participant at a time, but breaking API.  New major release. ([#144](https://github.com/pact-foundation/pact-node/issues/144)) ([2032ba2](https://github.com/pact-foundation/pact-node/commit/2032ba2))



## 6.21.5 (2019-02-26)



<a name="6.21.4"></a>
## [6.21.4](https://github.com/pact-foundation/pact-node/compare/6.21.3...6.21.4) (2019-02-09)



<a name="6.19.11"></a>
## [6.19.11](https://github.com/pact-foundation/pact-node/compare/v6.19.10...v6.19.11) (2018-08-21)



<a name="6.19.10"></a>
## [6.19.10](https://github.com/pact-foundation/pact-node/compare/v6.19.8...v6.19.10) (2018-08-13)



<a name="6.19.8"></a>
## [6.19.8](https://github.com/pact-foundation/pact-node/compare/6.19.7...6.19.8) (2018-07-28)



<a name="6.19.6"></a>
## [6.19.6](https://github.com/pact-foundation/pact-node/compare/v6.19.5...v6.19.6) (2018-07-13)



<a name="6.19.5"></a>
## [6.19.5](https://github.com/pact-foundation/pact-node/compare/6.19.4...6.19.5) (2018-07-13)


### Bug Fixes

* **binary-location:** Fixing failing tests on windows because the path.resolve would add 'C:\' to the front of the path, failing the expectation ([40f4d6d](https://github.com/pact-foundation/pact-node/commit/40f4d6d))



<a name="6.16.4"></a>
## [6.16.4](https://github.com/pact-foundation/pact-node/compare/6.16.3...6.16.4) (2018-05-10)



<a name="6.16.1"></a>
## [6.16.1](https://github.com/pact-foundation/pact-node/compare/6.16.0...6.16.1) (2018-05-08)



<a name="6.14.3"></a>
## [6.14.3](https://github.com/pact-foundation/pact-node/compare/v6.14.2...v6.14.3) (2018-04-17)


### Bug Fixes

* **verifier:** update error message if pactUrls not specified. Fixes [#78](https://github.com/pact-foundation/pact-node/issues/78) ([1e7bfda](https://github.com/pact-foundation/pact-node/commit/1e7bfda))



<a name="6.14.2"></a>
## [6.14.2](https://github.com/pact-foundation/pact-node/compare/v6.14.1...v6.14.2) (2018-04-05)



<a name="6.14.1"></a>
## [6.14.1](https://github.com/pact-foundation/pact-node/compare/v6.14.0...v6.14.1) (2018-04-04)



<a name="6.14.0"></a>
# [6.14.0](https://github.com/pact-foundation/pact-node/compare/v6.13.0...v6.14.0) (2018-03-30)


### Features

* **message:** add spec version to message type ([7839a12](https://github.com/pact-foundation/pact-node/commit/7839a12))



<a name="6.13.0"></a>
# [6.13.0](https://github.com/pact-foundation/pact-node/compare/6.12.3...6.13.0) (2018-03-27)


### Features

* **messages:** add Message Pact support ([980a3f5](https://github.com/pact-foundation/pact-node/commit/980a3f5))



<a name="6.10.0"></a>
# [6.10.0](https://github.com/pact-foundation/pact-node/compare/v6.9.0...v6.10.0) (2018-02-22)


### Features

* **upgrade:** upgrade pact standalone to 3.7.0 ([3b59836](https://github.com/pact-foundation/pact-node/commit/3b59836))



<a name="6.9.0"></a>
# [6.9.0](https://github.com/pact-foundation/pact-node/compare/v6.8.0...v6.9.0) (2018-02-20)


### Features

* **upgrade:** upgrade pact standalone to 3.6.0 ([0aa6f8f](https://github.com/pact-foundation/pact-node/commit/0aa6f8f))



<a name="6.8.0"></a>
# [6.8.0](https://github.com/pact-foundation/pact-node/compare/6.7.4...6.8.0) (2018-02-09)


### Features

* **upgrade:** upgrade pact standalone to 3.5.0 ([82928f1](https://github.com/pact-foundation/pact-node/commit/82928f1))



<a name="6.6.0"></a>
# [6.6.0](https://github.com/pact-foundation/pact-node/compare/v6.5.0...v6.6.0) (2017-12-13)


### Features

* **api:** add removeAll() interface to main API ([9306183](https://github.com/pact-foundation/pact-node/commit/9306183))
* **stub:** add basic stub support ([62185b5](https://github.com/pact-foundation/pact-node/commit/62185b5))



<a name="6.5.0"></a>
# [6.5.0](https://github.com/pact-foundation/pact-node/compare/v6.4.1...v6.5.0) (2017-12-10)


### Features

* **pactFileWriteMode:** add pactFileWriteMode to server. Fixes [#50](https://github.com/pact-foundation/pact-node/issues/50) ([0f8658b](https://github.com/pact-foundation/pact-node/commit/0f8658b))



<a name="6.4.1"></a>
## [6.4.1](https://github.com/pact-foundation/pact-node/compare/v6.4.0...v6.4.1) (2017-12-08)



<a name="6.4.0"></a>
# [6.4.0](https://github.com/pact-foundation/pact-node/compare/v6.3.0...v6.4.0) (2017-12-08)


### Features

* **upgrade:** upgrade pact standalone to 3.4.0 ([a77f9f7](https://github.com/pact-foundation/pact-node/commit/a77f9f7))



<a name="6.3.0"></a>
# [6.3.0](https://github.com/pact-foundation/pact-node/compare/v6.2.0...v6.3.0) (2017-12-04)


### Features

* **custom-headers:** allow user to specify custom headers during provider verification ([3797193](https://github.com/pact-foundation/pact-node/commit/3797193))



<a name="6.2.0"></a>
# [6.2.0](https://github.com/pact-foundation/pact-node/compare/v6.1.0...v6.2.0) (2017-12-04)


### Features

* **types:** re-export out common types for library use ([fa19b57](https://github.com/pact-foundation/pact-node/commit/fa19b57))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/pact-foundation/pact-node/compare/6.0.0...6.1.0) (2017-12-03)


### Bug Fixes

* **lint:** add noImplicitThis to TS configuration ([eb17979](https://github.com/pact-foundation/pact-node/commit/eb17979))
* **lint:** fix noImplicitReturns TS issues ([5c57288](https://github.com/pact-foundation/pact-node/commit/5c57288))


### Features

* **types:** add support for TS 'strictNullChecks' ([76d8c38](https://github.com/pact-foundation/pact-node/commit/76d8c38))
* **types:** feedback from mboudreau ([e756592](https://github.com/pact-foundation/pact-node/commit/e756592))
* **types:** uplift code base to comply with noImplicitAny ([861ae89](https://github.com/pact-foundation/pact-node/commit/861ae89))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
