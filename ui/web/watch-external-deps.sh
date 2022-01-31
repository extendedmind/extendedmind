#!/bin/bash
set -euo pipefail
./node_modules/.bin/ibazel run //ui/web:external-deps-refresh
