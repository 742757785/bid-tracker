@echo off
npm init -y
npm install node-fetch@2 cheerio
node fetch-data.js
git add data.json
git commit -m "update data"
git push
pause
