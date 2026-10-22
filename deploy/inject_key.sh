#!/bin/bash
# Build (Cloudflare Pages és Netlify): a helyőrző (__ESRI_KEY__) cseréje az ESRI_KEY környezeti változóra; kulcs nélkül a légifotó-réteg kimarad, minden más működik
set -e
# Netlifyn a hivatkozások (megosztás, og:url) a Netlify-címre mutassanak; a Netlify az URL változóban adja meg az oldal fő címét
if [ "$NETLIFY" = "true" ] && [ -n "$URL" ]; then
  grep -rl "https://jak-szeleromu.pages.dev" site --include=*.html | while read -r f; do sed -i "s#https://jak-szeleromu.pages.dev#${URL}#g" "$f"; done
  grep -rl "a Cloudflare, Inc. (USA)" site --include=*.html | while read -r f; do sed -i "s/a Cloudflare, Inc. (USA)/a Netlify, Inc. (USA)/g" "$f"; done   # a hírlevél adatfeldolgozója itt a Netlify
  echo "Fő cím: $URL"
fi
if [ -z "$ESRI_KEY" ]; then echo "Figyelem: nincs ESRI_KEY, a nagy felbontású légifotó nem lesz elérhető."; exit 0; fi
grep -rl "__ESRI_KEY__" site --include=*.html | while read -r f; do sed -i "s/__ESRI_KEY__/${ESRI_KEY}/g" "$f"; done
echo "Esri-kulcs beillesztve."
