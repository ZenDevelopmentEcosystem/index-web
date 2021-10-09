#!/usr/bin/env bash
set -eu

if [ -n "${INDEX_WEB_CONFIG:-}" ]; then
    echo "INDEX_WEB_CONFIG is set. Creating new config /usr/share/nginx/html/config/config.json."
    echo "${INDEX_WEB_CONFIG:-}" > /usr/share/nginx/html/config/config.json
fi
