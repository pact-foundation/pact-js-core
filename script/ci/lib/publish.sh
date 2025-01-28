#!/bin/bash -eu
set -eu # Windows bash does not read the #! line above

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../../lib/robust-bash.sh

require_binary npm

echo "--> Releasing version ${VERSION}"

echo "--> Releasing artifacts"
echo "    Publishing pact-core@${VERSION}..."
if [[ ${DRY_RUN:-} == 'true' ]]; then
  echo "publishing in dry run mode"
  # Dry-run Publish os/arch specific npm packages
  "$SCRIPT_DIR"/../build-opt-dependencies.sh publish
  npm publish --access-public --dry-run
 else
  echo "--> Preparing npmrc file"
  "$SCRIPT_DIR"/create_npmrc_file.sh
  echo "--> Removing binding.gyp to prevent rebuild. See https://github.com/npm/cli/issues/5234#issuecomment-1291139150"
  rm "${SCRIPT_DIR}/../../../binding.gyp"
  # Publish os/arch specific npm packages
  PUBLISH=true "$SCRIPT_DIR"/../build-opt-dependencies.sh publish
  npm publish --access public --tag latest
fi
echo "    done!"
