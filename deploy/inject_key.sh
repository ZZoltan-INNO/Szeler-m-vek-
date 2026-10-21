#!/bin/bash
# a helyőrző (__ESRI_KEY__) cseréje a Netlify ESRI_KEY környezeti változójára; kulcs nélkül a légifotó-réteg kimarad, minden más működik
set -e
if [ -z "$ESRI_KEY" ]; then echo "Figyelem: nincs ESRI_KEY, a nagy felbontású légifotó nem lesz elérhető."; exit 0; fi
grep -rl "__ESRI_KEY__" site --include=*.html | while read -r f; do sed -i "s/__ESRI_KEY__/${ESRI_KEY}/g" "$f"; done
echo "Esri-kulcs beillesztve."
