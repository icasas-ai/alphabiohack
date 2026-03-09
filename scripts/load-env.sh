#!/bin/sh
set -eu

default_env_file="${1:-}"
env_file="${ALPHABIOHACK_ENV_FILE:-$default_env_file}"

if [ -n "$env_file" ] && [ -f "$env_file" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$env_file"
  set +a
fi
