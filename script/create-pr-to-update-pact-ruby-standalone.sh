#!/usr/bin/env bash -e

: "${1?Please supply the pact-ruby-standalone version to upgrade to}"

STANDALONE_VERSION=$1
TYPE=${2:-fix}
DASHERISED_VERSION=$(echo "${STANDALONE_VERSION}" | sed 's/\./\-/g')
BRANCH_NAME="chore/upgrade-to-pact-ruby-standalone-${DASHERISED_VERSION}"

git checkout master
git checkout standalone/install.ts
git pull origin master

git checkout -b ${BRANCH_NAME}

cat standalone/install.ts | sed "s/export const PACT_STANDALONE_VERSION.*/export const PACT_STANDALONE_VERSION = '${STANDALONE_VERSION}';/" > tmp-install
mv tmp-install standalone/install.ts

git add standalone/install.ts
git commit -m "${TYPE}: update standalone to ${STANDALONE_VERSION}"
git push --set-upstream origin ${BRANCH_NAME}

hub pull-request --browse --message "${TYPE}: update standalone to ${STANDALONE_VERSION}"

git checkout master
