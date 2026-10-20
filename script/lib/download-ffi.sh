#!/bin/bash -eu
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "${LIB_DIR}/robust-bash.sh"
. "${LIB_DIR}/download-file.sh"

require_binary curl
require_binary tar
require_binary xz
require_binary unzip
require_binary mktemp

require_env_var FFI_VERSION

BASEURL=https://github.com/pact-foundation/pact-reference/releases/download
FFI_DIR="${LIB_DIR}/../../ffi"

if [[ $(find "${FFI_DIR}" -name "${FFI_VERSION}*") ]]; then
  log "Skipping download of FFI libraries ${FFI_VERSION}, as they exist"
  exit 0
fi

warn "Cleaning ffi directory $FFI_DIR"
rm -rf "${FFI_DIR:?}"
mkdir -p "$FFI_DIR/macos-x86_64"
mkdir -p "$FFI_DIR/linux-x86_64"
mkdir -p "$FFI_DIR/linux-musl-x86_64"
mkdir -p "$FFI_DIR/windows-x86_64"
mkdir -p "$FFI_DIR/macos-aarch64"
mkdir -p "$FFI_DIR/linux-aarch64"
mkdir -p "$FFI_DIR/linux-musl-aarch64"

function download_ffi_file {
  if [ -z "${1:-}" ]; then
    error "${FUNCNAME[0]} requires the filename to download"
    exit 1
  fi
  if [ -z "${2:-}" ]; then
    error "${FUNCNAME[0]} requires the output filename to download"
    exit 1
  fi
  FFI_FILENAME="$1"
  OUTPUT_FILENAME="$2"

  URL="${BASEURL}/pact_ffi-${FFI_VERSION}/${FFI_FILENAME}"
  DOWNLOAD_LOCATION="$FFI_DIR/${OUTPUT_FILENAME}"

  log "Downloading ffi $FFI_VERSION for $FFI_FILENAME"
  download_to "$URL" "$DOWNLOAD_LOCATION"
  debug_log " ... downloaded to '$DOWNLOAD_LOCATION'"
}

function verify_sha256 {
  # Checks <archive> against the <archive>.sha256 file next to it. The .sha256 files end
  # in a blank line, which sha256sum warns about, so it is stripped.
  local dir archive
  dir="$(dirname "$1")"
  archive="$(basename "$1")"
  if command -v sha256sum > /dev/null; then
    (cd "$dir" && sed '/^$/d' "${archive}.sha256" | sha256sum -c -)
  else
    (cd "$dir" && sed '/^$/d' "${archive}.sha256" | shasum -a 256 -c -)
  fi
}

# download_ffi <rust target> <archive extension> <name of the library in the archive> <output file under ffi/>...
# Extracts each listed library into the output file given after it.
function download_ffi {
  if [ -z "${1:-}" ] || [ -z "${2:-}" ] || [ -z "${3:-}" ] || [ -z "${4:-}" ]; then
    error "${FUNCNAME[0]} requires the target, archive extension, and at least one library/output pair"
    exit 1
  fi
  TARGET="$1"
  EXT="$2"
  shift 2

  ARCHIVE="pact_ffi-${TARGET}.${EXT}"
  WORK_DIR="$(mktemp -d)"
  URL="${BASEURL}/pact_ffi-${FFI_VERSION}/${ARCHIVE}"

  log "Downloading ffi $FFI_VERSION for $TARGET"
  download_to "$URL" "$WORK_DIR/$ARCHIVE"
  download_to "$URL.sha256" "$WORK_DIR/$ARCHIVE.sha256"
  verify_sha256 "$WORK_DIR/$ARCHIVE"

  if [[ "$EXT" == "zip" ]]; then
    EXTRACT_DIR="$WORK_DIR/extracted"
    mkdir -p "$EXTRACT_DIR"
    unzip -q "$WORK_DIR/$ARCHIVE" -d "$EXTRACT_DIR"
    ARCHIVE_ROOT="$EXTRACT_DIR"
  else
    tar -xJf "$WORK_DIR/$ARCHIVE" -C "$WORK_DIR"
    ARCHIVE_ROOT="$WORK_DIR/pact_ffi-${TARGET}"
  fi

  while [ $# -ge 2 ]; do
    cp "$ARCHIVE_ROOT/$1" "$FFI_DIR/$2"
    debug_log " ... extracted '$1' to '$FFI_DIR/$2'"
    shift 2
  done
  rm -rf "$WORK_DIR"
}

if [[ ${RUNNER_OS:-} == 'Windows' ]]; then
  ONLY_DOWNLOAD_PACT_FOR_WINDOWS=true
fi

if [ -z "${ONLY_DOWNLOAD_PACT_FOR_WINDOWS:-}" ]; then
  download_ffi x86_64-unknown-linux-gnu tar.xz libpact_ffi.so linux-x86_64/libpact_ffi.so
  download_ffi aarch64-unknown-linux-gnu tar.xz libpact_ffi.so linux-aarch64/libpact_ffi.so
  download_ffi x86_64-unknown-linux-musl tar.xz libpact_ffi.so linux-musl-x86_64/libpact_ffi_musl.so
  download_ffi aarch64-unknown-linux-musl tar.xz libpact_ffi.so linux-musl-aarch64/libpact_ffi_musl.so
  download_ffi x86_64-apple-darwin tar.xz libpact_ffi.dylib macos-x86_64/libpact_ffi.dylib
  download_ffi aarch64-apple-darwin tar.xz libpact_ffi.dylib macos-aarch64/libpact_ffi.dylib
else
  warn "Skipped download of non-windows FFI libs because ONLY_DOWNLOAD_PACT_FOR_WINDOWS is set"
fi

download_ffi x86_64-pc-windows-msvc zip \
  pact_ffi.dll windows-x86_64/pact_ffi.dll \
  pact_ffi.dll.lib windows-x86_64/pact_ffi.dll.lib

download_ffi_file "pact.h" "pact.h"
download_ffi_file "pact-cpp.h" "pact-cpp.h"

# Write readme in the ffi folder
cat << EOF > "$FFI_DIR/README.md"
# FFI binaries

This folder is automatically populated during build by /script/download-ffi.sh
EOF
