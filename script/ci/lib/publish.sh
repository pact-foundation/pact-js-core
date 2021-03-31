#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/robust-bash.sh

require_binary npm

VERSION="$("$SCRIPT_DIR/get-version.sh")"

echo "--> Preparing npmrc file"
"$SCRIPT_DIR"/create_npmrc_file.sh

echo "--> Releasing version ${VERSION}"

echo "--> Releasing artifacts"
echo "    Publishing pact-node@${VERSION}..."
npm publish --access public --tag latest
echo "    done!"
