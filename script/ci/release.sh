#!/bin/bash -eu
SCRIPT_DIR="$(
  cd "$(dirname "${BASH_SOURCE[0]}")"
  pwd
)" # Figure out where the script is running
. "$SCRIPT_DIR"/../lib/robust-bash.sh

if [[ ${DRY_RUN:-} == 'true' && ${CI:-"false"} == "false" ]]; then
  echo "running in dry run mode and not in CI"
else
  require_env_var CI "This script must be run from CI. If you are running locally, note that it stamps your repo git settings."
  if [[ ${GITHUB_ACTIONS:-} == 'true' ]]; then
    require_env_var GITHUB_ACTOR
    # Setup git for github actions
    git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
    git config user.name "${GITHUB_ACTOR}"
  fi
fi
REPO=${REPO:-pact-foundation/pact-js-core}

# It's easier to read the release notes
# from the standard version tool before it runs
RELEASE_NOTES="$(npx -y commit-and-tag-version --dry-run | awk 'BEGIN { flag=0 } /^---$/ { if (flag == 0) { flag=1 } else { flag=2 }; next } flag == 1')"
echo "$RELEASE_NOTES"
NEXT_VERSION=$(npx -y commit-and-tag-version --dry-run | grep 'tagging release' | grep -E -o "([0-9\.]+(-[a-z\.0-9]+)?)")
NEXT_TAG="v${NEXT_VERSION}"
GIT_SHA=$(git rev-parse HEAD)
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "${GH_CREATE_PRE_RELEASE:-}" = true ]; then
  echo "Creating pre-release ${NEXT_TAG}"
  if gh release view ${NEXT_TAG} --repo ${REPO}; then
    echo "${NEXT_TAG} exists, checking if pre-release"
    if gh release view ${NEXT_TAG} --repo ${REPO} --json isPrerelease | jq -e '.isPrerelease == false' >/dev/null; then
      echo "${NEXT_TAG} exists, and is not a pre-release, exiting"
      exit 1
    elif gh release view ${NEXT_TAG} --repo ${REPO} --json isPrerelease | jq -e '.isPrerelease == true' >/dev/null; then
      echo "${NEXT_TAG} exists, and is a pre-release, updating"
      gh release edit ${NEXT_TAG} --prerelease --draft --repo ${REPO} --title "Release ${NEXT_TAG}" --notes "${RELEASE_NOTES}" --target ${GIT_SHA}
      exit 0
    fi
  else
    echo "doesnt exist, lets create"
    gh release create ${NEXT_TAG} --prerelease --draft --repo ${REPO} --title "Release ${NEXT_TAG}" --notes "${RELEASE_NOTES}" --target ${GIT_SHA}
    exit 0
  fi
  echo "echo shouldnt get here"
  exit 0
elif [ "${GH_PRE_RELEASE_UPLOAD:-}" = true ]; then
  echo "Uploading pre-release ${NEXT_TAG}"
  gh release upload ${NEXT_TAG} prebuilds/*.tar.gz --repo ${REPO} --clobber
  exit 0
fi

if [[ ${CI:-} == 'true' ]]; then
  require_env_var NODE_AUTH_TOKEN
fi

if [[ ${RUNNER_OS:-} == 'Windows' ]]; then
  ONLY_DOWNLOAD_PACT_FOR_WINDOWS=true
fi

if [ ! -z "${ONLY_DOWNLOAD_PACT_FOR_WINDOWS:-}" ]; then
  error "The environment variable ONLY_DOWNLOAD_PACT_FOR_WINDOWS is set"
  echo "   - you cannot run a release with this variable set"
  echo "     as only the windows binaries would be included"
  echo "*** STOPPING RELEASE PROCESS ***"
  exit 1
fi

FETCH_ASSETS=true ./script/ci/check-release-libs.sh --fetch-assets -t "${NEXT_TAG}"
"$SCRIPT_DIR"/../download-plugins.sh
export pkg_version=$NEXT_VERSION
"$SCRIPT_DIR"/build-opt-dependencies.sh build
"$SCRIPT_DIR"/build-opt-dependencies.sh update
"$SCRIPT_DIR"/build-and-test.sh

if [[ ${DRY_RUN:-} == 'true' ]]; then
  VERSION=$NEXT_VERSION
  TAG=$NEXT_TAG
else
  # Don't release if there are no changes
  if [ "$(echo "$RELEASE_NOTES" | wc -l)" -eq 1 ]; then
    error "This release would have no release notes. Does it include changes?"
    echo "   - You must have at least one fix / feat commit to generate release notes"
    echo "*** STOPPING RELEASE PROCESS ***"
    exit 1
  fi
  npm run release
  # Emit tag to next step
  VERSION="$("$SCRIPT_DIR/lib/get-version.sh")"
  TAG="v${VERSION}"
fi
export VERSION
set +eu
# GITHUB_OUPUT is unset if testing DRY_RUN locally
echo "VERSION=$VERSION" >> $GITHUB_OUTPUT
set -eu
"$SCRIPT_DIR"/lib/publish.sh

# Push the new commit back to the repo.
# and update GH pre-release to released
if [[ ${DRY_RUN:-} == 'true' ]]; then
  echo "not pushing tags as in dry run mode"
else
  git push --follow-tags
  gh release edit ${TAG} --title "Release ${TAG}" --repo ${REPO} --notes "${RELEASE_NOTES}" --draft=false --prerelease=false --target ${GIT_SHA} --latest
fi
