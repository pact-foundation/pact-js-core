#!/bin/bash -eu
set -eu # Windows bash does not read the #! line above

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../../lib/robust-bash.sh

require_binary npm

VERSION="$("$SCRIPT_DIR/get-version.sh")"

echo "--> Releasing version ${VERSION}"

echo "--> Releasing artifacts"
echo "    Publishing pact-core@${VERSION}..."
if [[ ${DRY_RUN:-} == 'true' ]]; then
  echo "publishing in dry run mode"
  npm publish --access-public --dry-run
  else
  echo "--> Preparing npmrc file"
  "$SCRIPT_DIR"/create_npmrc_file.sh
  npm publish --access public --tag latest
fi
echo "    done!"
