#!/bin/bash -eu
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "${LIB_DIR}/robust-bash.sh"
. "${LIB_DIR}/download-file.sh"

require_binary curl
require_binary gunzip

FFI_VERSION=v0.0.1
BASEURL=https://github.com/pact-foundation/pact-reference/releases/download
FFI_DIR="${LIB_DIR}/../../ffi"

warn "Cleaning ffi directory $FFI_DIR"
rm -f "$FFI_DIR"/*

function download_ffi {
  if [ -z "${1:-}" ]; then
    error "${FUNCNAME[0]} requires the environment filename suffix"
    exit 1
  fi
  SUFFIX="$1"
  PREFIX="${2:-}"

  FFI_FILENAME="${PREFIX}pact_ffi-$SUFFIX"

  URL="${BASEURL}/libpact_ffi-${FFI_VERSION}/${FFI_FILENAME}"
  DOWNLOAD_LOCATION="$FFI_DIR/${FFI_VERSION}-${FFI_FILENAME}"

  log "Downloading ffi $FFI_VERSION for $SUFFIX"
  download_to "$URL" "$DOWNLOAD_LOCATION"
  gunzip "$DOWNLOAD_LOCATION"
  log " ... saved to '$DOWNLOAD_LOCATION'"
}

if [ -z "${ONLY_DOWNLOAD_PACT_FOR_WINDOWS:-}" ]; then
  download_ffi "linux-x86_64.so.gz" "lib"
  download_ffi "osx-x86_64.dylib.gz" "lib"
  download_ffi "osx-aarch64-apple-darwin.dylib.gz" "lib"
else
  log "Skipped download of non-windows FFI libs"
fi

for file in windows-x86_64.dll.gz windows-x86_64.dll.lib.gz ; do
  download_ffi "$file" ""
done

# Write readme in the ffi folder
cat << EOF > "$FFI_DIR/README.md"
# FFI binaries

This folder is automatically populated during build by /script/download-ffi.sh
EOF
