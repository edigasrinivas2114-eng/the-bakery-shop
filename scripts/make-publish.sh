#!/usr/bin/env bash
# Builds the artifact preview copy from out/: relative paths, no reserved "_" folder, no doc wrapper.
set -e
SRC=out; DST=${1:-../publish}
rm -rf "$DST"; mkdir -p "$DST"; cp -r "$SRC"/. "$DST"/
cd "$DST"; rm -f 404.html
mv _next nx
grep -rl "_next/" . | while read f; do sed -i 's#_next/#nx/#g' "$f"; done
rm -f nx/static/chunks/polyfills-*.js
python3 - <<'PY'
import re
s=open('index.html').read()
s=re.sub(r'^<!DOCTYPE html>(<!--.*?-->)?<html[^>]*><head>','',s)
s=s.replace('</head><body>','',1).replace('</body></html>','')
s=re.sub(r'<title>.*?</title>','',s,count=1)
s=re.sub(r'<meta charSet="utf-8"/><meta name="viewport"[^>]*/>','',s,count=1)
s=re.sub(r'<script src="[^"]*polyfills[^"]*"[^>]*></script>','',s)
open('index.html','w').write('<title>The Bakery Shop</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'+s)
PY
sed -i "s|href=\"/icon.svg|href=\"icon.svg|g" index.html
find nx media brand icon.svg index.txt -type f | python3 -c "import sys,json;print(json.dumps([{'path':l.strip()} for l in sys.stdin]))" > files.json
