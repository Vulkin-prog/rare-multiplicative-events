#!/usr/bin/env python3
"""Check the static Pages export using only Python's standard library."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import base64
import json
import re

ROOT = Path(__file__).resolve().parents[1] / 'docs'
OFFLINE = 'arithmetique_du_hasard_autonome.html'


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.links = set(), []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate id: {attrs['id']}"
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append(attrs[key])


pages = {p: Page(p.read_text()) for p in ROOT.glob('*.html') if p.name != OFFLINE}
references = 0


def check_url(source, url):
    global references
    part = urlsplit(url)
    if part.scheme or part.netloc:
        return
    assert not part.path.startswith('/'), f'{source.name}: root-relative URL {url}'
    target = (source.parent / unquote(part.path)).resolve() if part.path else source
    assert target.is_relative_to(ROOT), f'{source.name}: URL escapes docs: {url}'
    assert target.is_file(), f'{source.name}: missing local target {url}'
    if part.fragment and target in pages:
        assert unquote(part.fragment) in pages[target].ids, f'{source.name}: missing fragment {url}'
    references += 1


for path, page in pages.items():
    for link in page.links:
        check_url(path, link)
for path in ROOT.rglob('*.css'):
    for match in re.findall(r'url\(([^)]+)\)', path.read_text()):
        check_url(path, match.strip(' \"\''))

standalone = (ROOT / OFFLINE).read_text()
match = re.search(r'<script type="application/json" id="offline-data">(.*?)</script>', standalone, re.S)
assert match, 'Missing offline data'
data = json.loads(match[1])
for filename, key in data['routes'].items():
    assert data['pages'][key] == (ROOT / filename).read_text(), f'Stale offline page: {filename}'
assert not data.get('pdfs'), 'PDFs must not be embedded in the standalone file'
assert 'data:application/pdf' not in standalone, 'Embedded PDF data URI'
assert not list(ROOT.rglob('*.pdf')), 'PDF files must be hosted on Zenodo'
for filename, content in data['downloads'].items():
    assert base64.b64decode(content, validate=True) == (ROOT / filename).read_bytes(), f'Stale embedded file: {filename}'
manifest = json.loads((ROOT / 'assets/corpus-manifest.json').read_text())
for item in manifest.values():
    assert 'file' not in item and 'companion' not in item, 'Local PDF reference in manifest'
    if item['name'] != 'Paper C Lean formalization':
        assert item['url'] == 'https://zenodo.org/records/' + item['doi'], item['url']
    if 'companion_url' in item:
        assert item['companion_url'] == item['url'], item['companion_url']
assert (ROOT / '.nojekyll').is_file(), 'Missing .nojekyll'
print(f'PASS static export: {len(pages)} HTML routes, {references} local references, {len(data["pages"])} offline views, Zenodo manuscript links, bibliography and no stored or embedded PDFs.')
