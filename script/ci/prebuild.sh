#!/bin/bash -eu
set -e # This needs to be here for windows bash, which doesn't read the #! line above
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../lib/robust-bash.sh

if [[ ${SET_NVM:-} == 'true' && "$(uname -s)" == 'Darwin' ]]; then
  NVM_DIR=${NVM_DIR:-"$HOME/.nvm"}
  . $(brew --prefix nvm)/nvm.sh # Load nvm
  nvm install $NODE_VERSION
  nvm use $NODE_VERSION
elif [[ ${SET_NVM:-} == 'true' && "$(uname -s)" == 'Linux' ]]; then
  NVM_DIR=${NVM_DIR:-"$HOME/.nvm"}
  . $NVM_DIR/nvm.sh # Load nvm
  nvm install $NODE_VERSION
  nvm use $NODE_VERSION
fi

PREBUILDIFY_VERSION=6.0.1
NODE_VERSION=$(node -p process.version)
PREBUILD_NAME="node.napi"

## normalise OS and ARCH names
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m | tr '[:upper:]' '[:lower:]')
case $OS in
  "windows"* | "mingw64"*)
    OS=win32
    ;;
esac
node --version
npm --version
echo "OS: $OS"
echo "ARCH: $ARCH"

# The Windows runner images now ship Visual Studio 2026, whose version
# node-gyp only learned to recognise in 12.1.0. Older versions detect the
# install, fail to read its version and abort with "Could not find any
# Visual Studio installation to use", so the native build cannot run at
# all. node-gyp is bundled with npm, and 12.1.0 first shipped in npm 11.6.3.
if [[ $OS == win32 ]]; then
  MIN_NPM_VERSION=11.6.3
  MIN_NODE_GYP_VERSION=12.1.0

  if ! version_gte "$(npm --version)" "${MIN_NPM_VERSION}"; then
    log "npm $(npm --version) bundles a node-gyp that cannot detect Visual Studio 2026, upgrading"
    npm install --global "npm@>=${MIN_NPM_VERSION}"
  fi

  require_min_version npm "$(npm --version)" "${MIN_NPM_VERSION}"

  NODE_GYP_BIN="$(npm root --global)/npm/node_modules/node-gyp/bin/node-gyp.js"
  if [[ -f ${NODE_GYP_BIN} ]]; then
    require_min_version node-gyp "$(node "${NODE_GYP_BIN}" --version)" "${MIN_NODE_GYP_VERSION}"
  else
    error "Could not find the node-gyp bundled with npm at ${NODE_GYP_BIN}"
    echo "   - unable to verify it is new enough to detect Visual Studio 2026"
    exit 1
  fi
fi

./script/download-libs.sh
npm ci --ignore-scripts || npm i --ignore-scripts
export npm_config_target=${NODE_VERSION}
npx --yes prebuildify@${PREBUILDIFY_VERSION} --napi --name ${PREBUILD_NAME}
ls prebuilds/**/*
case $OS in
  darwin)
    case $ARCH in
      arm64)
        tar -czf prebuilds/darwin-arm64.tar.gz prebuilds/darwin-arm64
        ;;
      x86_64)
        tar -czf prebuilds/darwin-x64.tar.gz prebuilds/darwin-x64
        ;;
      *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
    esac
    ;;
  linux)
    echo "Linux"
    case $ARCH in
      aarch64)
        echo "aarch64"
        tar -czf prebuilds/linux-arm64.tar.gz prebuilds/linux-arm64
        ;;
      x86_64)
        tar -czf prebuilds/linux-x64.tar.gz prebuilds/linux-x64
        ;;
      *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
    esac
    ;;
  win32)
    case $ARCH in
      arm64)
        tar -czf prebuilds/win32-arm64.tar.gz prebuilds/win32-arm64
        ;;
      x86_64)
        tar -czf prebuilds/win32-x64.tar.gz prebuilds/win32-x64
        ;;
      *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
    esac
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac
ls
rm -rf ffi build