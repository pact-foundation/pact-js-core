#!/bin/sh

# Script to trigger release of gem via the pact-foundation/release-gem action
# Requires a Github API token with repo scope stored in the
# environment variable GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES

: "${GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES:?Please set environment variable GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES}"

if [ -n "$1" ]; then
  version="\"${1}\""
else
  version="null"
fi

repository_slug=$(git remote get-url $(git remote show) | cut -d':' -f2 | sed 's/\.git//')

output=$(curl -v -X POST https://api.github.com/repos/${repository_slug}/dispatches \
      -H 'Accept: application/vnd.github.everest-preview+json' \
      -H "Authorization: Bearer $GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES" \
      -d "{\"event_type\": \"pact-ruby-standalone-released\", \"client_payload\": {\"version\": ${version}}}" 2>&1)

if  ! echo "${output}" | grep "HTTP\/.* 204" > /dev/null; then
  echo "$output" | sed  "s/${GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES}/********/g"
  echo "Failed to trigger release"
  exit 1
else
  echo "Release workflow triggered"
fi

echo "https://github.com/${repository_slug}/actions?query=workflow%3A%22Update+Pact+Ruby+Standalone%22"
