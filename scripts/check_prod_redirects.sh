#!/usr/bin/env bash
set -e
URLS=(
  "http://tantramassagecostarica.com/"
  "http://www.tantramassagecostarica.com/"
  "https://tantramassagecostarica.com/"
  "https://tantramassagecostarica.com/tantra-massage-costa-rica"
  "https://tantramassagecostarica.com/tantra-massage-costa-rica/"
  "https://tantramassagecostarica.com/masseuses"
  "https://tantramassagecostarica.com/masseuses/"
  "https://tantramassagecostarica.com/masseuses/rosario-rodriguez"
  "https://tantramassagecostarica.com/masseuses/rosario-rodriguez/"
  "https://tantramassagecostarica.com/assets/styles.css"
  "https://tantramassagecostarica.com/assets/site.js"
  "https://tantramassagecostarica.com/sitemap.xml"
)

for u in "${URLS[@]}"; do
  echo "\n=== CHECK: $u ==="
  # Show the redirect chain and final effective URL and status
  echo "-- Final effective URL and status --"
  curl -sS -o /dev/null -w "effective:%{url_effective} code:%{http_code}\n" "$u"
  echo "-- Final response headers (first 20 lines) --"
  curl -sS -I -L "$u" | sed -n '1,20p'
  echo "-- Full redirect trace (verbose minimal) --"
  curl -sS -L -I -v "$u" 2>&1 | sed -n '1,120p'
done
