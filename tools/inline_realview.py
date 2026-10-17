"""A src/realview.js (3D látkép-motor) bemásolása az index.html és az alap.html jelölt helyére.

Használat: python3 tools/inline_realview.py
"""
import os, re
root = os.path.join(os.path.dirname(__file__), '..')
js = open(os.path.join(root, 'src', 'realview.js'), encoding='utf-8').read()
block = '<script>/* REALVIEW:BEGIN – forrás: src/realview.js */\n' + js + '\n/* REALVIEW:END */</script>'
for name in ('index.html', 'alap.html'):
    p = os.path.join(root, name)
    s = open(p, encoding='utf-8').read()
    s, n = re.subn(r'<script>/\* REALVIEW:BEGIN.*?/\* REALVIEW:END \*/</script>', lambda m: block, s, flags=re.S)
    assert n == 1, (name, n)
    open(p, 'w', encoding='utf-8').write(s)
    print(name, 'frissítve')
