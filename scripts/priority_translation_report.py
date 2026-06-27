#!/usr/bin/env python3
from pathlib import Path
import re
import sys
import csv

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
    seen_es = set()
    for p in html:
        rel = p.relative_to(root).as_posix()
        if rel.startswith('es/'):
            continue
        es_candidate = root / ('es/' + rel)
        if es_candidate.exists():
            pairs.append((p, es_candidate))
            seen_es.add(es_candidate)
        else:
            # try alternate link
            txt = p.read_text(encoding='utf-8', errors='replace')
            m = re.search(r'<link[^>]+hreflang=["\']es["\'][^>]*href=["\']([^"\']+)["\']', txt, re.I)
            if m:
                href = m.group(1)
                if href.startswith('/'):
                    candidate = root / href.lstrip('/')
                    if candidate.exists():
                        pairs.append((p, candidate))
                        seen_es.add(candidate)
    return pairs

def norm_words(s: str):
    if not s:
        return set()
    s2 = re.sub(r'[^\w\s]', ' ', s.lower())
    return set(w for w in s2.split() if len(w) > 2)

def jacc(a,b):
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    inter = a & b
    union = a | b
    return len(inter) / len(union) if union else 0.0

SPANISH_WORDS = {'masaje','salud','beneficios','beneficio','masajista','tantrico','tántrico','costarica','costa','rica','hombre','masculina','masculino','lectura','actualizado'}
ENGLISH_WORDS = {'benefits','health','men','guide','blog','massage','tantra','wellness','healing'}

rows = []
pairs = find_pairs(ROOT)

for en, es in pairs:
    en_rel = en.relative_to(ROOT).as_posix()
    es_rel = es.relative_to(ROOT).as_posix()
    en_title = extract_tag(en, 'title')
    es_title = extract_tag(es, 'title')
    en_h1 = extract_tag(en, 'h1')
    es_h1 = extract_tag(es, 'h1')
    en_title_empty = (en_title == '')
    es_title_empty = (es_title == '')
    en_h1_empty = (en_h1 == '')
    es_h1_empty = (es_h1 == '')
    title_sim = jacc(norm_words(en_title), norm_words(es_title))
    h1_sim = jacc(norm_words(en_h1), norm_words(es_h1))
    # possible inversion heuristics
    en_spanish_hits = len(SPANISH_WORDS & norm_words(en_title + ' ' + en_h1))
    es_english_hits = len(ENGLISH_WORDS & norm_words(es_title + ' ' + es_h1))
    possible_inversion = en_spanish_hits > 0 or es_english_hits > 0

    rows.append({
        'en': en_rel,
        'es': es_rel,
        'en_title': en_title,
        'es_title': es_title,
        'en_h1': en_h1,
        'es_h1': es_h1,
        'en_title_empty': en_title_empty,
        'es_title_empty': es_title_empty,
        'en_h1_empty': en_h1_empty,
        'es_h1_empty': es_h1_empty,
        'title_sim': f"{title_sim:.2f}",
        'h1_sim': f"{h1_sim:.2f}",
        'possible_inversion': 'yes' if possible_inversion else 'no'
    })

# sort by severity: missing fields and low similarity and inversion
def severity_key(r):
    score = 0
    if r['en_title_empty'] or r['es_title_empty'] or r['en_h1_empty'] or r['es_h1_empty']:
        score += 100
    if r['possible_inversion'] == 'yes':
        score += 80
    score -= float(r['title_sim']) * 50
    score -= float(r['h1_sim']) * 30
    return -score

rows_sorted = sorted(rows, key=severity_key)

out_csv = OUT / 'translation_validation_priority.csv'
with out_csv.open('w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['en','es','en_title','es_title','en_h1','es_h1','en_title_empty','es_title_empty','en_h1_empty','es_h1_empty','title_sim','h1_sim','possible_inversion'])
    for r in rows_sorted:
        writer.writerow([r['en'], r['es'], r['en_title'], r['es_title'], r['en_h1'], r['es_h1'], r['en_title_empty'], r['es_title_empty'], r['en_h1_empty'], r['es_h1_empty'], r['title_sim'], r['h1_sim'], r['possible_inversion']])

print('Wrote', out_csv)