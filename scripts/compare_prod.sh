#!/usr/bin/env bash
set -e
URL=https://tantramassagecostarica.com/assets/styles.css
OUT=/tmp/prod_styles.css
curl -sS -D /tmp/prod_headers.txt -o "$OUT" "$URL" || true
echo "--- headers ---"
sed -n '1,120p' /tmp/prod_headers.txt || true

echo "--- prod sha1 ---"
sha1sum "$OUT" || true

echo "--- local sha1 ---"
sha1sum /mnt/c/Users/Elizabeth/tantramassagecostarica/assets/styles.css || true

echo "--- diff excerpt (first 240 lines) ---"
sed -n '1,240p' /mnt/c/Users/Elizabeth/tantramassagecostarica/assets/styles.css > /tmp/local_excerpt.css || true
sed -n '1,240p' "$OUT" > /tmp/prod_excerpt.css || true
diff -u /tmp/local_excerpt.css /tmp/prod_excerpt.css || true

echo "--- fetch /masseuses/ ---"
curl -sS -D /tmp/p_headers1.txt -o /tmp/p_masseuses.html https://tantramassagecostarica.com/masseuses/ || true
sed -n '1,120p' /tmp/p_masseuses.html || true

echo "--- fetch /masseuses/valery-castillo/ ---"
curl -sS -D /tmp/p_headers2.txt -o /tmp/p_valery.html https://tantramassagecostarica.com/masseuses/valery-castillo/ || true
sed -n '1,200p' /tmp/p_valery.html || true
