#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${0}")"; pwd)" # Figure out where the script is running

node --version
npm --version
PREBUILDIFY_VERSION=6.0.1
NODE_VERSION=$(node -p process.version)
PREBUILD_NAME="node.napi"

apk add bash curl python3 make g++

. "${SCRIPT_DIR}/../lib/export-binary-versions.sh"
"${SCRIPT_DIR}/../lib/download-ffi.sh"
rm -rf build node_modules
npm ci --ignore-scripts || npm i --ignore-scripts
export npm_config_target=${NODE_VERSION}

npx --yes prebuildify@${PREBUILDIFY_VERSION} --napi --libc musl --strip --tag-libc --name ${PREBUILD_NAME}
ls prebuilds/**/*
ARCH=$(uname -m | tr '[:upper:]' '[:lower:]')
case $ARCH in
    aarch64)
    echo "aarch64"
    tar -czf prebuilds/linux-arm64-musl.tar.gz prebuilds/linux-arm64
    ;;
    x86_64)
    tar -czf prebuilds/linux-x64-musl.tar.gz prebuilds/linux-x64
    ;;
    *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac
rm -rf ffi build