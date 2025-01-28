#!/bin/bash -eu

# Usage: ./check-release-libs.sh [OPTIONS]
# 
# This script checks the release assets of a GitHub repository.
# 
# Options:
#   -r, --repo <REPO>        The GitHub repository to check (default: pact-foundation/pact-js-core)
#   -t, --tag <TAG>          The release tag to check (default: TAG)
#   -l, --list-assets        List the remote release assets
#   -f, --fetch-assets       Fetch the remote release assets (will clean local assets)
#   -c, --clean-assets       Clean the local release assets
#
# Example:
#   ./check-release-libs.sh -r myorg/myrepo -t v1.0.0 -l
#
# This will list the remote release assets of the myorg/myrepo repository for the v1.0.0 tag.

# Parse command line arguments
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -r|--repo)
    REPO="$2"
    shift # past argument
    shift # past value
    ;;
    -t|--tag)
    TAG="$2"
    shift # past argument
    shift # past value
    ;;
    -l|--list-assets)
    LIST_ASSETS=true
    shift # past argument
    ;;
    -f|--fetch-assets)
    FETCH_ASSETS=true
    shift # past argument
    ;;
    -c|--clean-assets)
    CLEAN_ASSETS=true
    shift # past argument
    ;;
    *)    # unknown option
    echo "Unknown option: $1"
    exit 1
    ;;
esac
done

# Set default values for REPO and TAG if not provided
REPO=${REPO:-pact-foundation/pact-js-core}
TAG=${NEXT_TAG:-${TAG:-latest}}

echo "Checking release assets"

if [[ "${CLEAN_ASSETS:-}" = true || "${FETCH_ASSETS:-}" = true ]]; then
    echo "Cleaning local release assets"
    rm -rf *.tar.gz
    rm -rf prebuilds
fi

if [[ "$TAG" == "" ]]; then
    echo "Please provide a release TAG to check"
    exit 1
else
    GH_TAG_OPTION="$TAG"
    if [[ "$TAG" == "latest" ]]; then
        GH_TAG_OPTION=$(gh release list --limit 1 --repo pact-foundation/pact-js-core --json tagName --jq '.[].tagName')
    fi

    if [[ "${LIST_ASSETS:-}" = true || "${FETCH_ASSETS:-}" = true ]]; then
        echo "Listing remote release assets for ${REPO} ${GH_TAG_OPTION}"
        gh release view --repo "${REPO}" $GH_TAG_OPTION --json assets | jq '.assets[].name'
    fi

    if [ "${FETCH_ASSETS:-}" = true ]; then
        echo "Fetching release assets"
        gh release download --repo "${REPO}" $GH_TAG_OPTION
    fi

fi

ERRORS=()
ls *.gz
ls *.gz | xargs -n1 tar -xzf
rm *.tar.gz
ls -1 prebuilds/**

[[ -f prebuilds/darwin-arm64/libpact_ffi.dylib ]] || ERRORS='prebuilds/darwin-arm64/libpact_ffi.dylib'
[[ -f prebuilds/darwin-arm64/node.napi.node ]] || ERRORS='prebuilds/darwin-arm64/node.napi.node'

[[ -f prebuilds/darwin-x64/libpact_ffi.dylib ]] || ERRORS='prebuilds/darwin-x64/libpact_ffi.dylib'
[[ -f prebuilds/darwin-x64/node.napi.node ]] || ERRORS='prebuilds/darwin-x64/node.napi.node'

[[ -f prebuilds/linux-arm64/libpact_ffi.so ]] || ERRORS='prebuilds/linux-arm64/libpact_ffi.so'
[[ -f prebuilds/linux-arm64/node.napi.node ]] || ERRORS='prebuilds/linux-arm64/node.napi.node'

[[ -f prebuilds/linux-arm64/libpact_ffi_musl.so ]] || ERRORS='prebuilds/linux-arm64/libpact_ffi_musl.so'
[[ -f prebuilds/linux-arm64/node.napi.musl.node ]] || ERRORS='prebuilds/linux-arm64/node.napi.musl.node'

[[ -f prebuilds/linux-x64/libpact_ffi.so ]] || ERRORS='prebuilds/linux-x64/libpact_ffi.so'
[[ -f prebuilds/linux-x64/node.napi.node ]] || ERRORS='prebuilds/linux-x64/node.napi.node'

[[ -f prebuilds/linux-x64/libpact_ffi_musl.so ]] || ERRORS='prebuilds/linux-x64/libpact_ffi_musl.so'
[[ -f prebuilds/linux-x64/node.napi.musl.node ]] || ERRORS='prebuilds/linux-x64/node.napi.musl.node'

[[ -f prebuilds/win32-x64/pact_ffi.dll ]] || ERRORS='prebuilds/win32-x64/pact_ffi.dll'
[[ -f prebuilds/win32-x64/node.napi.node ]] || ERRORS='prebuilds/win32-x64/node.napi.node'

if [ ! -z "${ERRORS:-}" ]; then
    echo "The following files are missing from the release:"
    echo $ERRORS
    exit 1
else
    echo "All release files are present"
fi