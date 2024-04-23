# !/bin/bash -eu
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
PREBUILDIFY_VERSION=6.0.1
NODE_VERSION=$(node -p process.version)

./script/download-libs.sh
npm ci --ignore-scripts
export npm_config_target=${NODE_VERSION}
npx --yes prebuildify@${PREBUILDIFY_VERSION} --napi
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