#!/bin/bash -eu
set -e
set -u
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "${LIB_DIR}/robust-bash.sh"
. "${LIB_DIR}/download-file.sh"

require_binary curl
require_binary unzip
require_env_var STANDALONE_VERSION

BASEURL=https://github.com/pact-foundation/pact-ruby-standalone/releases/download
STANDALONE_DIR="${LIB_DIR}/../../standalone"

function download_standalone {
  if [ -z "${1:-}" ]; then
    error "${FUNCNAME[0]} requires the filename to download from"
    exit 1
  fi

  if [ -z "${2:-}" ]; then
    error "${FUNCNAME[0]} requires the filename to save the download in"
    exit 1
  fi
  STANDALONE_FILENAME="$2"

  URL="${BASEURL}/v${STANDALONE_VERSION}/${1}"
  DOWNLOAD_LOCATION="$STANDALONE_DIR/${STANDALONE_FILENAME}"


  log "Downloading standalone version $STANDALONE_VERSION to $DOWNLOAD_LOCATION"
  download_to "$URL" "$DOWNLOAD_LOCATION"
  if [ "${STANDALONE_FILENAME%zip}" != "${STANDALONE_FILENAME}" ]; then
    unzip -qo "$DOWNLOAD_LOCATION" -d "${DOWNLOAD_LOCATION%.*}"
    rm "${DOWNLOAD_LOCATION}"
  else
    mkdir -p "${DOWNLOAD_LOCATION%.tar.gz}"
    tar -xf "$DOWNLOAD_LOCATION" -C "${DOWNLOAD_LOCATION%.tar.gz}"
    rm "${DOWNLOAD_LOCATION}"
  fi
}

log "Downloading Ruby standalone ${STANDALONE_VERSION}"

if [[ $(find "${STANDALONE_DIR}" -name "*${STANDALONE_VERSION}") ]]; then
  log "Skipping download of Ruby standalone, as it exists"
  exit 0
fi

download_standalone "pact-${STANDALONE_VERSION}-windows-x86_64.zip"            "windows-x64-${STANDALONE_VERSION}.zip"

if [[ ${RUNNER_OS:-} == 'Windows' ]]; then
  ONLY_DOWNLOAD_PACT_FOR_WINDOWS=true
fi

if [ -z "${ONLY_DOWNLOAD_PACT_FOR_WINDOWS:-}" ]; then
  download_standalone "pact-${STANDALONE_VERSION}-osx-x86_64.tar.gz"           "darwin-x64-${STANDALONE_VERSION}.tar.gz"
  download_standalone "pact-${STANDALONE_VERSION}-osx-arm64.tar.gz"           "darwin-arm64-${STANDALONE_VERSION}.tar.gz"
  download_standalone "pact-${STANDALONE_VERSION}-linux-x86_64.tar.gz"  "linux-x64-${STANDALONE_VERSION}.tar.gz"
  download_standalone "pact-${STANDALONE_VERSION}-linux-arm64.tar.gz"  "linux-arm64-${STANDALONE_VERSION}.tar.gz"
fi

# Write readme in the ffi folder
cat << EOF > "$STANDALONE_DIR/README.md"
# Standalone binaries

This folder is automatically populated during build by /script/download-standalone.sh
EOF
