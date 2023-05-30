# Developer documentation

Do this and you should be 👌👌👌:

```
bash script/download-libs.sh
npm ci
npm test
```


_notes_ - As a developer, you need to run `bash script/download-libs.sh` to download the FFI libraries prior to running `npm install` / `npm ci` as the libraries will be expected to be there, and you won't have any `node_modules` installed yet.

For end users, the `ffi` folder is populated, as part of the npm publishing step.

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
   1. Fork that supports running `container` tasks as `aarch64`


```sh
saffus run --output github-actions linux_arm --artifacts-dir tmp
```

#### Notes

Change `arm_container` to container



#### Publishing Assets

`cirrus run --output github-actions macos_arm --artifacts-dir tmp --environment GITHUB_TOKEN=$GITHUB_TOKEN --environment CIRRUS_RELEASE=test --environment CIRRUS_REPO_FULL_NAME=pact-foundation/pact-js-core;`

Change `arm_container` to container

`saffus run --output github-actions linux_arm --artifacts-dir tmp --environment GITHUB_TOKEN=$GITHUB_TOKEN --environment CIRRUS_RELEASE=test --environment CIRRUS_REPO_FULL_NAME=pact-foundation/pact-js-core;`