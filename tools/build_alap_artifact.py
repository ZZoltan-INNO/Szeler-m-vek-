"""Az alap.html-ből claude.ai artifact-forrást készít (a dokumentumvázat az artifact adja).

Használat: python3 tools/build_alap_artifact.py <kimeneti_fájl> [térképes_változat_url]
"""
import os, sys

root = os.path.join(os.path.dirname(__file__), '..')
s = open(os.path.join(root, 'alap.html'), encoding='utf-8').read()
for t in ['<!DOCTYPE html>\n', '<html lang="hu">\n', '<head>\n', '<meta charset="utf-8">\n',
          '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n',
          '</head>\n', '<body>\n', '</body>\n', '</html>\n']:
    assert s.count(t) == 1, t
    s = s.replace(t, '')
if len(sys.argv) > 2:
    s = s.replace('href="index.html"', f'href="{sys.argv[2]}" target="_blank" rel="noopener"')
open(sys.argv[1], 'w', encoding='utf-8').write(s)
print('kész:', sys.argv[1])
