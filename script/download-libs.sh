#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running

. "${SCRIPT_DIR}/lib/export-binary-versions.sh"
"${SCRIPT_DIR}/lib/download-ffi.sh"
"${SCRIPT_DIR}/lib/download-standalone.sh"