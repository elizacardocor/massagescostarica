#!/usr/bin/env bash
set -e
cd /mnt/c/Users/Elizabeth/tantramassagecostarica/assets/videos || exit 0
shopt -s nullglob
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "NO_FFMPEG"
  exit 2
fi
for f in *.mp4; do
  base="${f%.mp4}"
  ffmpeg -y -i "$f" -c:v libvpx-vp9 -b:v 0 -crf 30 -c:a libopus "${base}.webm"
  ffmpeg -y -ss 0.5 -i "$f" -vframes 1 -vf "scale=1200:630:force_original_aspect_ratio=decrease,pad=1200:630:(ow-iw)/2:(oh-ih)/2" "${base}.jpg"
  echo "CONVERTED:$f -> ${base}.webm, ${base}.jpg"
done
