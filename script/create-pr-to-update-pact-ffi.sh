#!/bin/sh

set -e

: "${1?Please supply the pact-ffi version to upgrade to}"

FFI_VERSION=$1
TYPE=${2:-fix}
DASHERISED_VERSION=$(echo "${FFI_VERSION}" | sed 's/\./\-/g')
BRANCH_NAME="chore/upgrade-to-pact-ffi-${DASHERISED_VERSION}"

git checkout master
git checkout src/ffi/index.ts
git pull origin master

git checkout -b ${BRANCH_NAME}

cat src/ffi/index.ts | sed "s/export const PACT_FFI_VERSION.*/export const PACT_FFI_VERSION = '${FFI_VERSION}';/" > tmp-install
mv tmp-install src/ffi/index.ts

git add src/ffi/index.ts
git commit -m "${TYPE}: update pact-ffi to ${STANDALONE_VERSION}"
git push --set-upstream origin ${BRANCH_NAME}

gh pr create --title "${TYPE}: update pact-ffi to ${STANDALONE_VERSION}" --fill

git checkout master
