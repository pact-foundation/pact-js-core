# Developer documentation

Pact-Js-Core uses FFI bindings from the pact-reference project, which are prebuilt for end users, the following steps will show some of the steps required to build and test locally on your machine.

Do this and you should be 👌👌👌:

```
bash script/ci/prebuild.sh
npm ci --ignore-scripts
npm run build
npm test
```

_notes_ - 

As a developer, you need to run `bash script/ci/prebuild.sh` to

- download the FFI libraries to `ffi` folder
- prebuilds the binaries and outputs to `prebuilds`
- cleans up `ffi` and `build`
- downloads the `pact-ruby-standalone` bindings to `standalone`

For end users, the following is provided as part of the packaging and release step in CI.

- the `prebuilds` folder containing built `ffi` bindings
- the `standalone` folder containing the pact ruby standalone bindings is populated, 
- the `binding.gyp` file is removed from the npm package, so `npm install` doesn't attempt to build the `ffi` buildings, that are prebuilt.

If you have a `binding.gyp` file, and have created `prebuilds` you will want to perform `npm ci` or `npm install` with `--ignore-scripts` set, to avoid building the `ffi` which is prebuilt.

Alternatively you can run the following, which will not create a prebuild, but instead use `node-gyp` to output the built `ffi` libraries to the `build` folder. This was the previous method, which meant that end users would also perform.

```
bash script/download-libs.sh
npm ci
npm run build
npm test
```

### Linux x86_64 Task

#### Pre Reqs

1. x86_64 Machine
   1. ARM64 Mac - If you have Rosetta (MacOS) 

### CI Locally

1. Docker/Podman
2. Act

```sh
act --container-architecture linux/amd64 -W .github/workflows/build-and-test.yml --artifact-server-path tmp
```

### MacOS x86_64 Task

#### Pre Reqs

1. Arm64 Mac with Rosetta
   1. install notes for rosetta
   2. prefix commands with `arch -x86_64`
2. x86_64 Mac

### CI Locally

1. Arm64 Mac with Rosetta
2. x86_64 Mac
3. Cirrus-Cli
4. Parallels

```sh
to be added
```

### MacOS ARM64 Task

#### Pre Reqs

1. Arm64 Mac

### CI Locally

1. Arm64 Mac
2. Cirrus-Cli
3. Tart.run


```sh
cirrus run --output github-actions macos_arm --artifacts-dir tmp
```

#### Notes

Change `arm_container` to container

### Linux ARM64 Task

#### Pre Reqs

1. Arm64 Machine

### CI Locally

1. Arm64 Machine
2. Docker / Podman
3. Cirrus-Cli


```sh
cirrus run --output github-actions linux_arm --artifacts-dir tmp
```

#### Publishing Assets

MacOS ARM64

`cirrus run --output github-actions macos_arm --artifacts-dir tmp --environment GITHUB_TOKEN=$GITHUB_TOKEN --environment CIRRUS_RELEASE=test --environment CIRRUS_REPO_FULL_NAME=pact-foundation/pact-js-core;`

Linux ARM64

`cirrus run --output github-actions linux_arm --artifacts-dir tmp --environment GITHUB_TOKEN=$GITHUB_TOKEN --environment CIRRUS_RELEASE=test --environment CIRRUS_REPO_FULL_NAME=pact-foundation/pact-js-core;`