#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running

"${SCRIPT_DIR}/download-ffi.sh"
"${SCRIPT_DIR}/download-standalone.sh"