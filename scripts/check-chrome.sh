#!/usr/bin/env bash
# Fail if a public page's nav/chrome drifts from the shared partials,
# or if leftover /weet/ links remain outside redirect stubs.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fail=0

nav_need=(
  'href="/over-mij/"'
  'href="/doe/"'
  'href="/denk/toolkit/"'
  'href="/denk/"'
  'href="/#contact"'
  'Ga naar inhoud'
  'aria-label="Thema wisselen"'
  'id="site-nav"'
  'class="nav-toggle"'
)

html_files=$(find "$ROOT" -name '*.html')

for file in $html_files; do
  rel="${file#"$ROOT"/}"
  case "$rel" in
    weet/*|kennis/*|partials/*) continue ;;
  esac
  for needle in "${nav_need[@]}"; do
    if ! grep -q -F "$needle" "$file"; then
      echo "MISSING in $rel: $needle"
      fail=1
    fi
  done
  if ! grep -q 'CHROME:header' "$file"; then
    echo "MISSING chrome markers in $rel"
    fail=1
  fi
  if grep -q 'href="/weet/' "$file" || grep -q 'https://damianvink.nl/weet/' "$file"; then
    echo "LEFTOVER /weet/ URL in $rel"
    fail=1
  fi
done

if [[ "$fail" -ne 0 ]]; then
  echo "check-chrome: FAIL"
  exit 1
fi
echo "check-chrome: OK"
