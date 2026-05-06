#!/bin/bash
npm init -y
npm install node-fetch cheerio
node fetch-data.js
git config user.email "action@github.com"
git config user.name "Action"
git add data.json
git commit -m "update" || true
git push
