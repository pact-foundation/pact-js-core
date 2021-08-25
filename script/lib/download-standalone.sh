#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "${SCRIPT_DIR}/robust-bash.sh"
. "${SCRIPT_DIR}/download-file.sh"

require_binary curl
require_binary unzip

STANDALONE_VERSION=$(grep "PACT_STANDALONE_VERSION = '" ./standalone/install.ts | grep -E -o "([0-9][\.0-9]+[0-9])")
BASEURL=https://github.com/pact-foundation/pact-ruby-standalone/releases/download
STANDALONE_DIR="${SCRIPT_DIR}/../../standalone"

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
  else
    mkdir -p "${DOWNLOAD_LOCATION%.tar.gz}"
    tar -xf "$DOWNLOAD_LOCATION" -C "${DOWNLOAD_LOCATION%.tar.gz}"
  fi
}

if [[ $(find "${STANDALONE_DIR}" -name "*${STANDALONE_VERSION}") ]]; then
  echo "skipping download of standalone, as they exist"
  exit 0
fi

download_standalone "pact-${STANDALONE_VERSION}-win32.zip"            "win32-${STANDALONE_VERSION}.zip"

if [ -z "${ONLY_DOWNLOAD_PACT_FOR_WINDOWS:-}" ]; then
  download_standalone "pact-${STANDALONE_VERSION}-osx.tar.gz"           "darwin-${STANDALONE_VERSION}.tar.gz"
  download_standalone "pact-${STANDALONE_VERSION}-linux-x86_64.tar.gz"  "linux-x64-${STANDALONE_VERSION}.tar.gz"
  download_standalone "pact-${STANDALONE_VERSION}-linux-x86.tar.gz"     "linux-ia32-${STANDALONE_VERSION}.tar.gz"
fi

# Write readme in the ffi folder
cat << EOF > "$STANDALONE_DIR/README.md"
# Standalone binaries

This folder is automatically populated during build by /script/download-standalone.sh
EOF
