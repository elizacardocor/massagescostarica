#!/usr/bin/env bash
set -e
TS=$(date +%s)
cd /mnt/c/Users/Elizabeth/tantramassagecostarica || exit 1
echo "cache-bust token: $TS"
# show files that will be changed
grep -R --line-number 'href="/assets/styles.css"' || true
# replace href in all HTML files
find . -type f -name '*.html' -print0 | xargs -0 sed -i "s|href=\"/assets/styles.css\"|href=\"/assets/styles.css?v=$TS\"|g"
# commit and push
git add -A
if git diff --staged --quiet; then
  echo 'No changes to commit'
else
  git commit -m "chore(cache): cache-bust styles.css ?v=$TS"
  git push origin main
fi
