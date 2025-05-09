#!/bin/bash
# push_all.sh - Automatically commit and push changes to GitHub

cd "$(dirname "$0")/.."
git add .
git commit -m "🔄 Auto-sync: $(date '+%Y-%m-%d %H:%M')"
git push origin main