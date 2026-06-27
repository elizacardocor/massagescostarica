#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Dry-run sync: copy title and first h1 from EN -> ES.tmp and show diff
EN="blog/benefits-karsai-nei-tsang-health/index.html"
ES="es/blog/beneficios-karsai-nei-tsang-salud/index.html"

if [ ! -f "$EN" ]; then echo "EN not found: $EN"; exit 1; fi
if [ ! -f "$ES" ]; then echo "ES not found: $ES"; exit 1; fi

EN_TITLE=$(perl -0777 -ne 'print $1 if /<title[^>]*>(.*?)<\/title>/si' "$EN" || true)
EN_H1=$(perl -0777 -ne 'print $1 if /<h1[^>]*>(.*?)<\/h1>/si' "$EN" || true)

echo "EN title: $EN_TITLE"
echo "EN h1: $EN_H1"

cp "$ES" "$ES".tmp

export EN_TITLE EN_H1

# replace or insert title
perl -0777 -pe '
  if (s#<title[^>]*>.*?</title>#"<title>" . $ENV{EN_TITLE} . "</title>"#sie) { }
  else { s#</head>#"<title>" . $ENV{EN_TITLE} . "</title>\n</head>"#sie }
' -i "$ES".tmp

# replace or insert first h1
perl -0777 -pe '
  if (s#<h1[^>]*>.*?</h1>#"<h1>" . $ENV{EN_H1} . "</h1>"#sie) { }
  else {
    if (s#(<main[^>]*>)#"$1\n" . "<h1>" . $ENV{EN_H1} . "</h1>"#sie) { }
    else { s#(<body[^>]*>)#"$1\n" . "<h1>" . $ENV{EN_H1} . "</h1>"#sie }
  }
' -i "$ES".tmp

echo "--- DIFF (ES vs ES.tmp) ---"
git --no-pager diff --no-index -- "$ES" "$ES".tmp || true

echo "Temp file preserved at $ES.tmp"
