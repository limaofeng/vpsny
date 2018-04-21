#！/usr/bin/bash
cp bugfixs/realm/download-realm.js node_modules/realm/scripts/download-realm.js
cd node_modules/realm && yarn add https-proxy-agent