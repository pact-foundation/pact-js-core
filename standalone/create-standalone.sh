#!/bin/bash -e

set -e

export PACT_STANDALONE_VERSION=1.29.1
export STANDALONE_PACKAGE_NAME=pact-standalone

urlprefix="https://github.com/pact-foundation/pact-ruby-standalone/releases/download/v$PACT_STANDALONE_VERSION/"
packages=(pact-$PACT_STANDALONE_VERSION-linux-x86.tar.gz pact-$PACT_STANDALONE_VERSION-linux-x86_64.tar.gz pact-$PACT_STANDALONE_VERSION-osx.tar.gz pact-$PACT_STANDALONE_VERSION-win32.zip)

echo "--> Downloading Ruby OS specific Binaries"

for package in "${packages[@]}"
do
	if [ ! -f "${package}" ]; then
	    echo "INFO: Downloading ${package}"
	    wget "${urlprefix}${package}"
	else
	  echo "INFO: '${package}' already downloaded."
	fi
done




set -ex

echo "--> Packaging distributions"

declare -A osarchs=(["osx"]="darwin" ["win32"]="win32" ["linux-x86"]="linux-ia32" ["linux-x86_64"]="linux-x64")
cd build
platformDir="platforms"

echo "--> Clearing previous dist"
if [ -d "${platformDir}" ]; then
  rm -rf ${platformDir}
fi
rm -rf build/pact-standalone-*
mkdir -p ${platformDir}

for os in "${!osarchs[@]}"
do
  echo "--> Building ${os}"
  outputFolder="${osarchs[$os]}"

  if [ "${os}" = "win32" ]; then
    unzip -q "pact-${PACT_STANDALONE_VERSION}-${os}.zip" -d "${outputFolder}" && f=("$outputFolder"/*) && mv "$outputFolder"/*/* "$outputFolder" && rmdir "${f[@]}"
    rm "${outputFolder}/bin/pact-publish.bat"
  else
    mkdir -p "${outputFolder}"
    tar -C "${outputFolder}" --strip-components=1 -xzf "pact-${PACT_STANDALONE_VERSION}-${os}.tar.gz"
    rm "${outputFolder}/bin/pact-publish"
  fi

  echo "--> Copying ${outputFolder} to dist"
  mv "${outputFolder}" "${platformDir}/"
done
