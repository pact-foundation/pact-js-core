# Developer documentation

Pact-Js-Core uses FFI bindings from the pact-reference project, which are prebuilt for end users, the following steps will show some of the steps required to build and test locally on your machine.

Do this and you should be 👌👌👌:

```sh
bash script/ci/prebuild.sh
supported_platforms=$(./script/ci/build-opt-dependencies.sh determine_platform) 
./script/ci/build-opt-dependencies.sh build
./script/ci/build-opt-dependencies.sh link
npm run build
npm run test
```

set supported platform to one of these values

- `linux-x64-glibc`
- `linux-arm64-glibc`
- `linux-x64-musl`
- `linux-arm64-musl`
- `darwin-x64`
- `darwin-arm64`
- `windows-x64`

_notes_ - 

As a developer, you need to run `bash script/ci/prebuild.sh` to

- download the FFI libraries to `ffi` folder
- prebuilds the binaries and outputs to `prebuilds`
- cleans up `ffi` and `build`

For end users, the following is provided as part of the packaging and release step in CI.

- the `prebuilds` folder containing built `ffi` bindings
- the `binding.gyp` file is removed from the npm package, so `npm install` doesn't attempt to build the `ffi` buildings, that are prebuilt.

If you have a `binding.gyp` file, and have created `prebuilds` you will want to perform `npm ci` or `npm install` with `--ignore-scripts` set, to avoid building the `ffi` which is prebuilt.

Alternatively you can run the following, which will not create a prebuild, but instead use `node-gyp` to output the built `ffi` libraries to the `build` folder. This was the previous method, which meant that end users would also perform.

```
bash script/download-libs.sh
npm ci
npm run build
npm run test
```

## Creating Platform specific packages

We create cross-platform and architecture binaries which are published individually to NPM, and consumed in this project.

### Download prebuilt binaries for all platforms

```sh
./script/ci/build_opt_dependencies.sh libs v15.2.1
```

Tag is optional and defaults to latest

This will run the following script, which will grab the latest prebuilt binaries from GitHub.

```sh
FETCH_ASSETS=true ./script/ci/check-release-libs.sh --fetch-assets -t v15.2.1
```

### Building all platform specific npm packages

```sh
./script/ci/build_opt_dependencies.sh build
```

### Building individual platform specific npm package

Supported platforms are

- linux-x64-glibc
- linux-arm64-glibc
- linux-x64-musl
- linux-arm64-musl
- darwin-x64
- darwin-arm64
- windows-x64

You can detect your platform with

```sh
./script/ci/build-opt-dependencies.sh determine_platform
```

You can build with one

```sh
supported_platforms=$(./script/ci/build-opt-dependencies.sh determine_platform) ./script/ci/build-opt-dependencies.sh build
```

or all

```sh
./script/ci/build-opt-dependencies.sh build
```

### Linking arch specific package, for your local build

Make link will try to link all available packages, for all available platforms, and will link any that apply

```sh
./script/ci/build-opt-dependencies.sh
```

You can scope it with `supported_platforms`

```sh
supported_platforms=$(./script/ci/build-opt-dependencies.sh determine_platform) ./script/ci/build-opt-dependencies.sh link
```

### Publishing packages

Dry run publishing optional packages, (default)

```sh
./script/ci/build-opt-dependencies.sh publish
```

Publishing packages with `--dry-run` option removed.

```sh
PUBLISH=true ./script/ci/build-opt-dependencies.sh publish
```

### Generating new prebuilds in CI

For speed, CI runs use prebuilds from master for test runs. If you wish to force a rebuild of the ffi package because

- the ffi library has been updated
- the ffi binding code has been updated

Raise a pull request and add `(rebuild)`, anywhere in the title'

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
