#!/bin/sh

$PORT=8000

# Start client server
python3 -m http.server $PORT
