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

node --version
npm --version
# Update main package.json optional dependencies versions, with those created earlier
current_platform=$("$SCRIPT_DIR"/build-opt-dependencies.sh determine_platform)
supported_platforms="$current_platform" "$SCRIPT_DIR"/build-opt-dependencies.sh update
# update lockfile post building updated opt deps
npm ci --ignore-scripts || npm i --ignore-scripts
# Link os/arch specific npm package, for running os/arch system

supported_platforms="$current_platform" "$SCRIPT_DIR"/build-opt-dependencies.sh link
# ensure we test against the linked npm package, not the prebuild
rm -rf prebuilds
npm run format:check
npm run lint
npm run build
npm run test