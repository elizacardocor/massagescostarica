#!/usr/bin/env python3
from pathlib import Path
import re
import json
import csv
import sys

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
OUT = ROOT / 'reports'
OUT.mkdir(exist_ok=True)

def extract_tag(path: Path, tag: str):
    try:
        txt = path.read_text(encoding='utf-8', errors='replace')
    except Exception:
        return ''
    m = re.search(rf'<{tag}[^>]*>(.*?)</{tag}>', txt, re.I | re.S)
    if m:
        return re.sub(r'\s+', ' ', m.group(1)).strip()
    return ''

def find_pairs(root: Path):
    html = list(root.rglob('*.html'))
    pairs = []
    for p in html:
        rel = p.relative_to(root).as_posix()
        if rel.startswith('es/'):
            continue
        # find es counterpart by convention
        es_candidate = root / ('es/' + rel)
        if es_candidate.exists():
            pairs.append((p, es_candidate))
        else:
            # try resolving via alternate link
            text = p.read_text(encoding='utf-8', errors='replace')
            m = re.search(r'<link[^>]+hreflang=["\']es["\'][^>]*href=["\']([^"\']+)["\']', text, re.I)
            if m:
                href = m.group(1)
                if href.startswith('/'):
                    candidate = root / href.lstrip('/')
                    if candidate.exists():
                        pairs.append((p, candidate))
    return pairs

pairs = find_pairs(ROOT)

rows = []
for en, es in pairs:
    en_rel = en.relative_to(ROOT).as_posix()
    es_rel = es.relative_to(ROOT).as_posix()
    en_title = extract_tag(en, 'title')
    es_title = extract_tag(es, 'title')
    en_h1 = extract_tag(en, 'h1')
    es_h1 = extract_tag(es, 'h1')
    rows.append({
        'en': en_rel,
        'es': es_rel,
        'en_title': en_title,
        'es_title': es_title,
        'en_h1': en_h1,
        'es_h1': es_h1,
    })

json_path = OUT / 'translation_report.json'
csv_path = OUT / 'translation_report.csv'
with json_path.open('w', encoding='utf-8') as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)

with csv_path.open('w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['en','es','en_title','es_title','en_h1','es_h1'])
    for r in rows:
        writer.writerow([r['en'], r['es'], r['en_title'], r['es_title'], r['en_h1'], r['es_h1']])

print('Wrote', json_path, csv_path)
