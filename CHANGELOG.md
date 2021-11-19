# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [10.15.0](https://github.com/pact-foundation/pact-node/compare/v10.14.0...v10.15.0) (2021-11-19)


### Features

* support specifying provider branch in verifications ([4e4231f](https://github.com/pact-foundation/pact-node/commit/4e4231fe7ac5c9b82dd183002bd012cbb7644e23))

## [10.14.0](https://github.com/pact-foundation/pact-node/compare/v10.13.10...v10.14.0) (2021-10-29)


### Features

* Add new branch consumerVersionSelector options to verifier ([365ecce](https://github.com/pact-foundation/pact-node/commit/365ecce0c7ba74e91da6d2ea32b9904c09bb7085))

### [10.13.10](https://github.com/pact-foundation/pact-node/compare/v10.13.9...v10.13.10) (2021-10-18)


### Fixes and Improvements

* **publisher:** Fix an issue that caused the publisher API to reject with the most recent binaries (As an aside, the recommended approach is to use the CLI not the API for almost all use cases- see the examples for more details) ([8d06cea](https://github.com/pact-foundation/pact-node/commit/8d06cea33bd7bcd932ca34e15c7b0c0305ff2ee7))
* Substantially improve error messages if the pact publisher API fails ([f528b9c](https://github.com/pact-foundation/pact-node/commit/f528b9cfab63d33e160e548a81f68592486fc2a8))

### [10.13.9](https://github.com/pact-foundation/pact-node/compare/v10.13.8...v10.13.9) (2021-10-11)


### Fixes and Improvements

* update standalone to 1.88.77 ([11dc749](https://github.com/pact-foundation/pact-node/commit/11dc749ddd17c9d0ad5c4ff2c42dde7d83b39842))

### [10.13.8](https://github.com/pact-foundation/pact-node/compare/v10.13.7...v10.13.8) (2021-10-01)


### Fixes and Improvements

* update standalone to 1.88.75 ([93c1276](https://github.com/pact-foundation/pact-node/commit/93c12767f13eb68aa7e858b80fb22cfdf8d656c0))

### [10.13.7](https://github.com/pact-foundation/pact-node/compare/v10.13.6...v10.13.7) (2021-09-08)

### [10.13.6](https://github.com/pact-foundation/pact-node/compare/v10.13.5...v10.13.6) (2021-09-08)


### Fixes and Improvements

* Allow the user to specify the timeout (Fixes [#298](https://github.com/pact-foundation/pact-node/issues/298), backported from 4c77ddb) ([c1fd849](https://github.com/pact-foundation/pact-node/commit/c1fd8493069a4571a68a25b1cfbd62ab5f412f4e))
* Fix an issue that caused ENOENT on some platforms ([76e2fa1](https://github.com/pact-foundation/pact-node/commit/76e2fa10b89be7f8d7b81a94d7bd6d0adc1e30e9))
* update standalone to 1.88.65 ([#319](https://github.com/pact-foundation/pact-node/issues/319)) ([9c20478](https://github.com/pact-foundation/pact-node/commit/9c20478163abb68506fb334174d443e2944f5902))

### [10.13.5](https://github.com/pact-foundation/pact-node/compare/v10.13.4...v10.13.5) (2021-09-06)


### Fixes and Improvements

* reduce npm package size ([7804c52](https://github.com/pact-foundation/pact-node/commit/7804c5269bc04b684eaa602ebf7af74cead74fe1))

### [10.13.4](https://github.com/pact-foundation/pact-node/compare/v10.13.3...v10.13.4) (2021-09-06)


### Fixes and Improvements

* Add consumer version selectors for deployedOrReleased, deployed, released and environment ([#715](https://github.com/pact-foundation/pact-node/issues/715)) ([27945f3](https://github.com/pact-foundation/pact-node/commit/27945f3465403604f9c2b0ce0b251e3b456b80c6))
* update tar to 6.1.11 ([bcf8fa0](https://github.com/pact-foundation/pact-node/commit/bcf8fa04cbe3efda19fd759250e2d8946135511c))

### [10.13.3](https://github.com/pact-foundation/pact-node/compare/v10.13.2...v10.13.3) (2021-08-12)


### Fixes and Improvements

* Expose needle types as a dependency rather than a devdependency to fix typescript users ([0fe0592](https://github.com/pact-foundation/pact-node/commit/0fe0592d369276e1c7098188c566248796e642d8))

### [10.13.2](https://github.com/pact-foundation/pact-node/compare/v10.13.1...v10.13.2) (2021-08-12)


### Fixes and Improvements

* Avoid throwing an exception if needle can't connect to the mock service during polling (may fix [#314](https://github.com/pact-foundation/pact-node/issues/314)) ([edc877f](https://github.com/pact-foundation/pact-node/commit/edc877f6d3334b290dceddf5906cb9782dab4fe5))
* update standalone to 1.88.63 ([7856a70](https://github.com/pact-foundation/pact-node/commit/7856a7073387545c9f1e695061245954f84e03d6))

### [10.13.1](https://github.com/pact-foundation/pact-node/compare/v10.13.0...v10.13.1) (2021-08-02)

## [10.13.0](https://github.com/pact-foundation/pact-node/compare/v10.12.1...v10.13.0) (2021-08-02)


### Features

* improve m1 support (via rosetta2) ([09c0b36](https://github.com/pact-foundation/pact-node/commit/09c0b3691727b425180f3baab41b295ea69939c3))


### Fixes and Improvements

* Replace request with needle ([5e0bdea](https://github.com/pact-foundation/pact-node/commit/5e0bdeaf39b91c44c8eb0f8fc2c0a4bb40260db5))
* update standalone to 1.88.46 ([e9f2b43](https://github.com/pact-foundation/pact-node/commit/e9f2b431b1118396c27814daaa0cfd4f538ea138))
* update standalone to 1.88.47 ([5626f3b](https://github.com/pact-foundation/pact-node/commit/5626f3bcb92ce3c7141373232e4ec3701d8ae2d8))
* update standalone to 1.88.48 ([14e31cf](https://github.com/pact-foundation/pact-node/commit/14e31cf812fd7f11fe84e130bcff4c50d0ff64de))
* update standalone to 1.88.49 ([cb088ce](https://github.com/pact-foundation/pact-node/commit/cb088ce64d670ce5babadfec53d561e00d9ad8ff))
* update standalone to 1.88.61 ([1d525f7](https://github.com/pact-foundation/pact-node/commit/1d525f717f88c1e023100ca0b642c11ee3d74122))

### [10.12.2](https://github.com/pact-foundation/pact-js-core/compare/v10.12.1...v10.12.2) (2021-04-20)


### Fixes and Improvements

* update standalone to 1.88.46 ([e9f2b43](https://github.com/pact-foundation/pact-js-core/commit/e9f2b431b1118396c27814daaa0cfd4f538ea138))
* update standalone to 1.88.47 ([5626f3b](https://github.com/pact-foundation/pact-js-core/commit/5626f3bcb92ce3c7141373232e4ec3701d8ae2d8))
* update standalone to 1.88.48 ([14e31cf](https://github.com/pact-foundation/pact-js-core/commit/14e31cf812fd7f11fe84e130bcff4c50d0ff64de))
* update standalone to 1.88.49 ([cb088ce](https://github.com/pact-foundation/pact-js-core/commit/cb088ce64d670ce5babadfec53d561e00d9ad8ff))

### [10.12.1](https://github.com/pact-foundation/pact-js-core/compare/v10.12.0...v10.12.1) (2021-03-31)


### Fixes and Improvements

* package.json & package-lock.json to reduce vulnerabilities ([8d76550](https://github.com/pact-foundation/pact-js-core/commit/8d76550a4dffcbf3fad477457b736a8ad09d05dd))
* update standalone to 1.88.41 ([3916c88](https://github.com/pact-foundation/pact-js-core/commit/3916c886698feef0deb786a944c2b1d9004c0c0a))
* update standalone to 1.88.45 ([fcab9f8](https://github.com/pact-foundation/pact-js-core/commit/fcab9f8aa9b9532026194799b68bf6df32b78272))

## [10.12.0](https://github.com/pact-foundation/pact-js-core/compare/v10.11.11...v10.12.0) (2021-03-05)


### Features

* **package-name:** Pact-node renamed to pact-core ([700ad09](https://github.com/pact-foundation/pact-js-core/commit/700ad099cebafdb5189e4cb8c09ed0131f24afc4))

### [10.11.11](https://github.com/pact-foundation/pact-node/compare/v10.11.10...v10.11.11) (2021-02-28)


### Fixes and Improvements

* update standalone to 1.88.40 ([618fb9d](https://github.com/pact-foundation/pact-node/commit/618fb9de5790de9484b4c32f0103c2f754f843e9))

### [10.11.10](https://github.com/pact-foundation/pact-node/compare/v10.11.9...v10.11.10) (2021-02-25)


### Fixes and Improvements

* update standalone to 1.88.38 ([de4aaf2](https://github.com/pact-foundation/pact-node/commit/de4aaf27932fdbd3707e0aa79f3d659cdfe0a870))

### [10.11.9](https://github.com/pact-foundation/pact-node/compare/v10.11.8...v10.11.9) (2021-02-24)


### Fixes and Improvements

* 🐛 only download binary if PACT_SKIP_BINARY_INSTALL is true ([69cbba0](https://github.com/pact-foundation/pact-node/commit/69cbba0f4800da79e01d594e5b1e0c3556c09551))

### [10.11.8](https://github.com/pact-foundation/pact-node/compare/v10.11.7...v10.11.8) (2021-02-09)


### Fixes and Improvements

* **install:** Use the current working directory instead of the installed directory when finding package.json (Fixes [#234](https://github.com/pact-foundation/pact-node/issues/234)) ([30c41dc](https://github.com/pact-foundation/pact-node/commit/30c41dc422e466b67ecf79ba31408f1caca999df))

### [10.11.7](https://github.com/pact-foundation/pact-node/compare/v10.11.6...v10.11.7) (2021-02-02)


### Fixes and Improvements

* **logger:** Log output now correctly reads pact-node instead of pact ([c9f22e1](https://github.com/pact-foundation/pact-node/commit/c9f22e16fe406a8474dbcae0c7a5dbf2a473881e))
* update standalone to 1.88.37 ([383eb8a](https://github.com/pact-foundation/pact-node/commit/383eb8aa30340dc5c4e2293a23b3ae42a60a3eb6))

### [10.11.6](https://github.com/pact-foundation/pact-node/compare/v10.11.5...v10.11.6) (2021-02-01)


### Fixes and Improvements

* **types:** Correctly export logger type (in the future we should use our own type) ([a4f766f](https://github.com/pact-foundation/pact-node/commit/a4f766f21a296baf737fb46c8e6c40a70652cdb8))

### [10.11.5](https://github.com/pact-foundation/pact-node/compare/v10.11.4...v10.11.5) (2021-02-01)


### Fixes and Improvements

* update standalone to 1.88.36 ([22e8414](https://github.com/pact-foundation/pact-node/commit/22e8414dc5604f2a8b2c221a04fa6cd8d481f2ff))
* **can-i-deploy:** Can-i-deploy now prints a warning instead of failing if additional output is produced alongside the json ([364afb2](https://github.com/pact-foundation/pact-node/commit/364afb2cdb9ffab6e3dd6312c3854439c172c3cb))
* **logger:** Imply verbose mode when log level is debug or trace ([814d4fb](https://github.com/pact-foundation/pact-node/commit/814d4fbe83e598748057c1b5f40b3bef60b86434))
* **logger:** Now pact-node and ruby use the same logLevel if specified ([513a60d](https://github.com/pact-foundation/pact-node/commit/513a60d00ec8dce8176a592941923b41e1938853))
* **logging:** Only log entire environment when log level is trace, not debug ([c3b9f5f](https://github.com/pact-foundation/pact-node/commit/c3b9f5fa84b80ccaeb49345b857346b8095f07b1))

### [10.11.4](https://github.com/pact-foundation/pact-node/compare/v10.11.3...v10.11.4) (2021-01-28)


### Fixes and Improvements

* update standalone to 1.88.35 ([d8dfe39](https://github.com/pact-foundation/pact-node/commit/d8dfe393671ae74c7f743b537a9e75f6a52656d0))

### [10.11.3](https://github.com/pact-foundation/pact-node/compare/v10.11.2...v10.11.3) (2021-01-28)


### Fixes and Improvements

* update standalone to 1.88.34 ([cba5625](https://github.com/pact-foundation/pact-node/commit/cba5625148e7ea733aeb1cdd4a6e24b4eebb6091))

### [10.11.2](https://github.com/pact-foundation/pact-node/compare/v10.11.1...v10.11.2) (2021-01-27)


### Fixes and Improvements

* **message:** Change the way pact-message is invoked which should avoid some issues in Windows environments ([92185b0](https://github.com/pact-foundation/pact-node/commit/92185b06db955c3e194317cffde8e27954b7ac9f))
* update standalone to 1.88.33 ([d42e348](https://github.com/pact-foundation/pact-node/commit/d42e3487d58b5f37a71d2d8b0692669af1035ff5))

### [10.11.1](https://github.com/pact-foundation/pact-node/compare/v10.11.0...v10.11.1) (2021-01-04)


### Bug Fixes

* **message:** Fixed an issue where message pacts could not be created on some platforms ([a092ed9](https://github.com/pact-foundation/pact-node/commit/a092ed904b43c132c00efd6c5e371faef9ea6e97))

## [10.11.0](https://github.com/pact-foundation/pact-node/compare/v10.10.2...v10.11.0) (2020-10-22)


### Features

* **install:** Binary install can be skipped by setting PACT_SKIP_BINARY_INSTALL=true ([4d6b194](https://github.com/pact-foundation/pact-node/commit/4d6b1945a58efa2b56b9b39dd3214e29c1637228))

### [10.10.2](https://github.com/pact-foundation/pact-node/compare/v10.10.1...v10.10.2) (2020-10-19)


### Bug Fixes

* Correct the config for using custom ca file ([e83c895](https://github.com/pact-foundation/pact-node/commit/e83c8958a34d46d63403fe56402fd5b8d4d6a3c0))
* spelling in error message. ([c40170d](https://github.com/pact-foundation/pact-node/commit/c40170d39e3ad92749276c158cfa33e32b0be4a9))
* update standalone to 1.88.3 ([6e1c80b](https://github.com/pact-foundation/pact-node/commit/6e1c80b1316c5a79d18bdc497bb764bab7775fb9))

### [10.10.1](https://github.com/pact-foundation/pact-node/compare/v10.10.0...v10.10.1) (2020-08-26)


### Bug Fixes

* **server:** remove force-clone of options ([1a7a6e0](https://github.com/pact-foundation/pact-node/commit/1a7a6e02448ef7c0fb445658ff47a3ca445018f6))

## [10.10.0](https://github.com/pact-foundation/pact-node/compare/v10.9.7...v10.10.0) (2020-08-10)


### Features

* **logging:** Add logLevel to Stub options, and add logDir and logLevel to Verifier options ([acc0579](https://github.com/pact-foundation/pact-node/commit/acc057927e14a80dfa74554614f9a6d1fa29a005))


### Bug Fixes

* **deps:** Update vulnerable dependencies ([239c7a7](https://github.com/pact-foundation/pact-node/commit/239c7a73c3d04289c038bbef70b3d47a1db34d56))
* package.json & package-lock.json to reduce vulnerabilities ([70aa0f0](https://github.com/pact-foundation/pact-node/commit/70aa0f0ec8d2c861b1457cc31eb533e5259ba907))
* update standalone to 1.86.0 ([524a7dd](https://github.com/pact-foundation/pact-node/commit/524a7ddb3716e2e76b598e250131531a675899ad))

### [10.9.7](https://github.com/pact-foundation/pact-node/compare/v10.9.6...v10.9.7) (2020-07-17)


### Bug Fixes

* **deps:** update package and package-lock to fix vulnerabilties ([6566680](https://github.com/pact-foundation/pact-node/commit/65666805766e9ae71377351dcbb62b5098e0191c))

### [10.9.6](https://github.com/pact-foundation/pact-node/compare/v10.9.5...v10.9.6) (2020-06-29)


### Bug Fixes

* **deps:** Update vulnerable dependencies ([d210c1b](https://github.com/pact-foundation/pact-node/commit/d210c1bcd3725f617c531b4338054cf1dabbb68a))

## [10.9.5](https://github.com/pact-foundation/pact-node/compare/v10.9.4...v10.9.5) (2020-06-03)


### Bug Fixes

* update standalone to 1.85.0 ([acb9aa9](https://github.com/pact-foundation/pact-node/commit/acb9aa9f8431939670e0dffa6a4a6c75c7f8152c))



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
