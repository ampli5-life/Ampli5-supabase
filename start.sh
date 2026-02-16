#!/usr/bin/env bash
# Build and start all containers so you see the latest code changes.
# Usage: ./start.sh
set -e
cd "$(dirname "$0")"
docker compose up --build -d
