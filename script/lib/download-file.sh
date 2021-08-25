#!/bin/bash -eu

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