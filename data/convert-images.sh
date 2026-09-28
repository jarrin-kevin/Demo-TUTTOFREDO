#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/.."

SRC_BASE="frontend/public/images"
DST_BASE="catalogo-fotos"

mkdir -p "$DST_BASE/products" "$DST_BASE/brand"

total=0
ok=0
fallback=0
failed=0
failed_list=()

for sub in products brand; do
  for f in "$SRC_BASE/$sub"/*.webp; do
    [ -e "$f" ] || continue
    total=$((total+1))
    base="$(basename "$f" .webp)"
    out="$DST_BASE/$sub/$base.jpg"
    if ffmpeg -y -loglevel error -i "$f" -q:v 3 "$out" 2>/tmp_err.log; then
      ok=$((ok+1))
    else
      # retry with format=yuv420p for alpha-channel webp
      if ffmpeg -y -loglevel error -i "$f" -vf format=yuv420p -q:v 3 "$out"; then
        ok=$((ok+1))
        fallback=$((fallback+1))
        echo "FALLBACK-OK: $f"
      else
        failed=$((failed+1))
        failed_list+=("$f")
        echo "FAILED: $f"
      fi
    fi
  done
done

echo "----"
echo "Total source files: $total"
echo "Converted OK: $ok"
echo "Needed fallback flag: $fallback"
echo "Failed: $failed"
if [ ${#failed_list[@]} -gt 0 ]; then
  printf '%s\n' "${failed_list[@]}"
fi
