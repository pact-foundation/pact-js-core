#!/bin/bash -eu
if [ -z "${LIB_ROBUST_BASH_SH:-}" ]; then
  LIB_ROBUST_BASH_SH=included
  
  function error {
    echo "❌  ${1:-}"
  }

  function log {
    echo "🔵  ${1:-}"
  }

  function debug_log {
    if [ ! -z "${LIB_ROBUST_BASH_DEBUG:-}" ]; then
      echo "🔎  ${1:-}"
    fi
  }

  function warn {
    echo "🟡  ${1:-}"
  }

  # Check to see that we have a required binary on the path
  # and fail the script if it is not present
  function require_binary {
    if [ -z "${1:-}" ]; then
      error "${FUNCNAME[0]} requires an argument"
      exit 1
    fi

    if ! [ -x "$(command -v "$1")" ]; then
      error "The required executable '$1' is not on the path."
      exit 1
    fi
  }

  # Check to see that we have a required environment variable set,
  # and fail the script if it is not set.
  #
  # Optionally, a second argument can be provided to display 
  # a helpful message before failing
  function require_env_var {
    var_name="${1:-}"
    if [ -z "${!var_name:-}" ]; then
      error "The required environment variable ${var_name} is empty"
      if [ ! -z "${2:-}" ]; then
        echo "  - $2"
      fi
      exit 1
    fi
  }

  # Compare two dotted versions, returning success when the first is
  # greater than or equal to the second.
  #
  # Comparison is delegated to node, which every script here already
  # depends on, so that it behaves identically on the macOS, Linux and
  # Git Bash environments the builds run in.
  function version_gte {
    node -e '
      const parse = (v) => String(v).replace(/^v/, "").split(".").map((n) => Number.parseInt(n, 10) || 0);
      const [a, b] = [parse(process.argv[1]), parse(process.argv[2])];
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const [x, y] = [a[i] || 0, b[i] || 0];
        if (x !== y) process.exit(x > y ? 0 : 1);
      }
      process.exit(0);
    ' "${1:-0}" "${2:-0}"
  }

  # Check that a tool meets a minimum version, and fail the script if it
  # does not. Takes a human readable name, the actual version and the
  # minimum required version.
  function require_min_version {
    if version_gte "${2:-}" "${3:-}"; then
      log "${1:-} ${2:-} satisfies the minimum of ${3:-}"
    else
      error "${1:-} ${2:-} is older than the required minimum of ${3:-}"
      exit 1
    fi
  }
fi