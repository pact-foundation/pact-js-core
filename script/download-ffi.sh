#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/ci/lib/robust-bash.sh


require_binary curl
require_binary gunzip

FFI_VERSION=v0.0.1
BASEURL=https://github.com/pact-foundation/pact-reference/releases/download
FFI_DIR="$SCRIPT_DIR/../ffi"

warn "Cleaning ffi directory $FFI_DIR"
rm -f "$FFI_DIR"/*


function download_to {
  if [ -z "${1:-}" ]; then
    error "${FUNCNAME[0]} requires the URL to download from as the first argument"
    exit 1
  fi
  if [ -z "${2:-}" ]; then
    error "${FUNCNAME[0]} requires the file to save the download in as the second argument"
    exit 1
  fi
  URL=$1
  OUTPUT_FILE=$2

  HTTP_CODE=$(curl --silent --output "$OUTPUT_FILE" --write-out "%{http_code}" --location "$URL")
  if [[ ${HTTP_CODE} -lt 200 || ${HTTP_CODE} -gt 299 ]] ; then
    error "Unable to download file at url ${URL}"
    error "Downloaded content follows"
    echo "$(cat $OUTPUT_FILE)"
    exit 1
  fi
}


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

  log "Downloading verifier $FFI_VERSION for $SUFFIX"
  download_to "$URL" "$DOWNLOAD_LOCATION"
  gunzip "$DOWNLOAD_LOCATION"
}

for file in linux-x86_64.so.gz osx-x86_64.dylib.gz osx-aarch64-apple-darwin.dylib.gz ; do
  download_ffi "$file" "lib"
done

for file in windows-x86_64.dll.gz windows-x86_64.dll.lib.gz ; do
  download_ffi "$file" ""
done

# Write readme in the ffi folder
cat << EOF > "$FFI_DIR/README.md"
# FFI binaries

This folder is automatically populated during build by /script/download-ffi.sh
EOF
