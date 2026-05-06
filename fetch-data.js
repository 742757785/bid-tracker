const https = require('https');
const http = require('http');
const fs = require('fs');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html'
      },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function parseLinks(html, source, region) {
  const bids = [];
  const regex = /<a[^>]+href="([^"]*)"[^>]*>([^<]+)<\/a>/g;
  let match;
  let i = 0;
  while ((match = regex.exec(html)) !== null) {
    const title = match[2].trim();
    if (title.length > 5 && title.length < 200) {
      let url = match[1];
      if (url && !url.startsWith('http')) {
        const base = source.url.match(/https?:\/\/[^\/]+/)[0];
        url = base + (url.startsWith('/') ? '' : '/') + url;
      }
      bids.push({ id: i++, title, url, source: source.name, region, category: '其他', date: '' });
    }
  }
  return bids;
}

async function main() {
  console.log('开始抓取...');
  let allBids = [];
  
  const sources = [
    { name: '茂名市政府', url: 'http://www.maoming.gov.cn/zwgk/gsgg/index.html', region: '茂名' },
    { name: '阳江市政府', url: 'http://www.yangjiang.gov.cn/yj/ywdt/gggs/index.html', region: '阳江' }
  ];
  
  for (const source of sources) {
    try {
      console.log('抓取 ' + source.name + '...');
      const html = await fetchPage(source.url);
      const bids = parseLinks(html, source, source.region);
      console.log(source.name + ': ' + bids.length + ' 条');
      allBids = allBids.concat(bids);
    } catch (e) {
      console.log(source.name + ' 失败: ' + e.message);
    }
  }
  
  const data = {
    updateTime: new Date().toISOString(),
    updateTimeCN: new Date().toLocaleString('zh-CN'),
    count: allBids.length,
    bids: allBids
  };
  
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log('完成! 共 ' + allBids.length + ' 条');
}

main().catch(console.error);
