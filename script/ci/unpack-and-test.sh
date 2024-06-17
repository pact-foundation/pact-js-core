#!/bin/bash -eu
set -e # This needs to be here for windows bash, which doesn't read the #! line above
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../lib/robust-bash.sh

ls -1
ls -1 artifact
mkdir -p prebuilds
mv artifact*/*.tar.gz . || echo "no mac prebuilds"
ls *.gz |xargs -n1 tar -xzf
"$SCRIPT_DIR"/build-and-test.sh