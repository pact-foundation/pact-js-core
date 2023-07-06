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

npm ci --ignore-scripts

npm run format:check
npm run lint
npm run build
npm run test
ls -1