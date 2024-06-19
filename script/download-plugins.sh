#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running

. "${SCRIPT_DIR}/lib/export-binary-versions.sh"
"${SCRIPT_DIR}/install-plugin-cli.sh"
$HOME/.pact/bin/pact-plugin-cli install -y https://github.com/mefellows/pact-matt-plugin/releases/tag/$PACT_PLUGIN_MATT_VERSION