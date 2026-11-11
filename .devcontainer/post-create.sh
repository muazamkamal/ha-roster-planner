#!/usr/bin/env bash
# Runs once after the container is created.
set -euo pipefail
cd "$(dirname "$0")/.."

# Python venv with Home Assistant (pinned via pytest-homeassistant-custom-component) and dev tools
uv venv --allow-existing .venv
uv pip install --python .venv/bin/python -r requirements_dev.txt

# Link the integration into HA's config so both scripts/develop and F5 load it
mkdir -p config/custom_components
ln -sfn ../../custom_components/roster_planner config/custom_components/roster_planner

# Frontend deps, once the panel source exists
if [ -f frontend/package.json ]; then
    (cd frontend && npm install)
fi

# Git hooks, once a pre-commit config exists
if [ -f .pre-commit-config.yaml ]; then
    .venv/bin/pre-commit install
fi

echo
echo "Ready. Start Home Assistant with: scripts/develop  (or F5 -> 'Home Assistant')"
