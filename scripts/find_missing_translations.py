#!/usr/bin/env python3
"""
Find missing translation counterparts between root and `es/` directories.

Usage: python3 scripts/find_missing_translations.py [root_dir]

Outputs two lists: pages missing an `es/` counterpart, and Spanish pages missing an English counterpart.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path
from typing import Dict, Optional


LINK_RE = re.compile(r'<link[^>]+rel=["\']?alternate["\']?[^>]*>', re.I)
HREF_RE = re.compile(r'href=["\']([^"\']+)["\']', re.I)
HL_RE = re.compile(r'hreflang=["\']([^"\']+)["\']', re.I)
CANON_RE = re.compile(r'<link[^>]+rel=["\']?canonical["\']?[^>]*href=["\']([^"\']+)["\'][^>]*>', re.I)


def parse_alternates(path: Path) -> Dict[str, str]:
    """Return mapping hreflang -> href for the HTML file head.
    hrefs are returned as raw values from the link tag (may be absolute or absolute-path).
    """
    text = path.read_text(encoding='utf-8', errors='replace')
    head = text.split('</head>', 1)[0]
    alternates = {}
    for m in LINK_RE.finditer(head):
        tag = m.group(0)
        hl = HL_RE.search(tag)
        href = HREF_RE.search(tag)
        if hl and href:
            alternates[hl.group(1).lower()] = href.group(1)
    can = CANON_RE.search(head)
    canonical = can.group(1) if can else None
    if canonical:
        alternates['canonical'] = canonical
    return alternates


def to_repo_path(root: Path, href: str) -> Optional[Path]:
    # Convert an href like https://domain.com/es/... or /es/... to repo-relative Path
    if href.startswith('http://') or href.startswith('https://'):
        # strip scheme+domain
        parts = href.split('://', 1)[1].split('/', 1)
        if len(parts) == 1:
            return None
        rel = parts[1]
    elif href.startswith('/'):
        rel = href.lstrip('/')
    else:
        # relative paths not handled
        rel = href
    p = root / rel
    if p.exists():
        return p
    # try adding index.html if href points to folder-like
    if (root / rel / 'index.html').exists():
        return root / rel / 'index.html'
    return None


def main(argv):
    root = Path(argv[1]) if len(argv) > 1 else Path.cwd()
    if not root.exists():
        print('ERROR: root not found', root)
        return 2

    html_files = list(root.rglob('*.html'))
    by_path = {p: parse_alternates(p) for p in html_files}

    paired = set()
    missing_es = []
    missing_en = []

    for p, data in by_path.items():
        rel = p.relative_to(root).as_posix()
        # skip assets and JS and files under assets
        if rel.startswith('assets/'):
            continue
        # determine language
        is_es = rel.startswith('es/')
        # if file declares an alternate, try to resolve counterpart
        opp_lang = 'es' if not is_es else 'en'
        alt_href = data.get(opp_lang)
        # fallback: look for canonical link on this file and derive counterpart by swapping /es/
        counterpart = None
        if alt_href:
            cp = to_repo_path(root, alt_href)
            counterpart = cp
        else:
            # try to infer by swapping /es/ in path
            if is_es:
                candidate = rel[3:]
                if (root / candidate).exists():
                    counterpart = root / candidate
            else:
                candidate = Path('es') / rel
                if candidate.exists():
                    counterpart = root / candidate

        if counterpart and counterpart.exists():
            paired.add(p)
            paired.add(counterpart)
        else:
            if is_es:
                missing_en.append(rel[3:] if rel.startswith('es/') else rel)
            else:
                missing_es.append(rel)

    print(f'Root: {root}')
    print(f'Total HTML files: {len(html_files)}')
    print('\nUnpaired English pages (no es alternate found):')
    for p in sorted(set(missing_es)):
        print('  ', p)
    print('\nUnpaired Spanish pages (no en alternate found):')
    for p in sorted(set(missing_en)):
        print('  ', p)

    print('\nNow comparing <title> and first <h1> between detected EN/ES pairs to find likely mismatches...')
    # build pairs list: for each en file, find its es counterpart
    def extract_text(path: Path, tag: str) -> Optional[str]:
        try:
            txt = path.read_text(encoding='utf-8', errors='replace')
        except Exception:
            return None
        m = re.search(rf'<{tag}[^>]*>(.*?)</{tag}>', txt, re.I | re.S)
        if m:
            return re.sub(r'\s+', ' ', m.group(1)).strip()
        return None

    def norm_words(s: Optional[str]):
        if not s:
            return set()
        s2 = re.sub(r'[^\w\s]', ' ', s.lower())
        return set(w for w in s2.split() if len(w) > 2)

    pairs = []
    for p in html_files:
        rel = p.relative_to(root).as_posix()
        if rel.startswith('es/'):
            continue
        # find es alternate
        alternates = by_path.get(p, {})
        es_href = alternates.get('es')
        es_path = None
        if es_href:
            es_path = to_repo_path(root, es_href)
        if not es_path:
            candidate = Path('es') / rel
            if (root / candidate).exists():
                es_path = root / candidate
        if es_path and es_path.exists():
            pairs.append((p, es_path))

    low_matches = []
    for en_p, es_p in pairs:
        en_title = extract_text(en_p, 'title') or ''
        es_title = extract_text(es_p, 'title') or ''
        en_h1 = extract_text(en_p, 'h1') or ''
        es_h1 = extract_text(es_p, 'h1') or ''
        # compare title and h1 separately
        t_en = norm_words(en_title)
        t_es = norm_words(es_title)
        h_en = norm_words(en_h1)
        h_es = norm_words(es_h1)

        def jacc(a, b):
            if not a and not b:
                return 1.0
            if not a or not b:
                return 0.0
            inter = a & b
            union = a | b
            return len(inter) / len(union) if union else 0.0

        title_sim = jacc(t_en, t_es)
        h1_sim = jacc(h_en, h_es)
        # flag if both similarities low
        if title_sim < 0.45 and h1_sim < 0.45:
            low_matches.append((en_p.relative_to(root).as_posix(), es_p.relative_to(root).as_posix(), title_sim, h1_sim, en_title, es_title, en_h1, es_h1))

    if not low_matches:
        print('  No obvious mismatches found between titles/h1 of EN/ES pairs.')
    else:
        print('\nPotential mismatches (low similarity):')
        for a in low_matches:
            en_rel, es_rel, ts, hs, et, st, eh, sh = a
            print(f"\nEN: {en_rel}\nES: {es_rel}\n title_sim={ts:.2f} h1_sim={hs:.2f}")
            print('  EN <title>:', et)
            print('  ES <title>:', st)
            print('  EN <h1>   :', eh)
            print('  ES <h1>   :', sh)

    print('\nNote: this script matches pages by explicit <link rel="alternate" hreflang> entries or by simple es/ path conventions.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
