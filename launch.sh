#!/bin/sh

PORT="${1}"

if [[ "${PORT}" = "" ]]; then
  PORT="8000"
fi

# Start client server
python3 -m http.server "${PORT}"
