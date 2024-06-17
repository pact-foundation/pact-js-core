#!/bin/bash -eu
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "${LIB_DIR}/robust-bash.sh"

function download_to {
  if [ -z "${1:-}" ]; then
    error "${FUNCNAME[0]} requires the URL to download from as the first argument"
    exit 1
  fi
  if [ -z "${2:-}" ]; then
    error "${FUNCNAME[0]} requires the file to save the download in as the second argument"
    exit 1
  fi
  debug_log "about to download"
  URL="$1"
  OUTPUT_FILE="$2"
  debug_log "doing curl of: '$URL', saving in $OUTPUT_FILE"

  if [[ "$(uname -m)" == "Darwin" ]] || [[ "$(uname -m)" == "Linux" ]]; then
    HTTP_CODE="$(curl --silent --output "$OUTPUT_FILE" --write-out "%{http_code}" --location "$URL")"
  else
  # temp workaround for curl 8.8.x error on windows gha runners
  # https://github.com/curl/curl/issues/13845
    curl --silent --output "$OUTPUT_FILE" --location "$URL"
    if [ $? -ne 0 ]; then
      error "Unable to download file at url ${URL}"
      exit 1
    else
      HTTP_CODE=200
    fi
  fi
  debug_log "did curl, http code was '${HTTP_CODE}'"
  if [[ "${HTTP_CODE}" -lt 200 || "${HTTP_CODE}" -gt 299 ]] ; then
    error "Unable to download file at url ${URL}"
    error "Downloaded content follows"
    cat "$OUTPUT_FILE"
    exit 1
  fi
}