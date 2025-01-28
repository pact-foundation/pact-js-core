#!/bin/bash -eu
set -e # This needs to be here for windows bash, which doesn't read the #! line above
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../lib/robust-bash.sh

if [ ! -d "prebuilds" ]; then
    ls -1
    ls -1 artifact*
    mkdir -p prebuilds
    mv artifact*/*.tar.gz .
    ls *.gz | xargs -n1 tar -xzf
fi

"$SCRIPT_DIR"/../download-plugins.sh
# Use the determined platform
current_platform=$("$SCRIPT_DIR"/build-opt-dependencies.sh determine_platform)
supported_platforms="$current_platform" "$SCRIPT_DIR"/build-opt-dependencies.sh build
"$SCRIPT_DIR"/build-and-test.sh