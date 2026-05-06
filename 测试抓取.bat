@echo off
echo ========================================
echo 招标信息抓取应用 - 本地测试
echo ========================================
echo.
echo 请确保已安装 Node.js
echo 下载地址: https://nodejs.org
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未安装 Node.js
    echo 请先安装 Node.js 后再运行此脚本
    pause
    exit /b 1
)

echo 正在安装依赖...
npm init -y >nul 2>&1
npm install node-fetch cheerio >nul 2>&1

echo.
echo 正在抓取数据...
echo.

node -e "
const https = require('https');
const http = require('http');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function main() {
    console.log('正在抓取茂名市政府网站...');
    try {
        const html = await fetchUrl('http://www.maoming.gov.cn/zwgk/gsgg/index.html');
        const matches = html.match(/<a[^>]+>([^<]{10,})<\/a>/g) || [];
        console.log('找到 ' + matches.length + ' 个链接');
        matches.slice(0, 5).forEach(m => {
            const title = m.replace(/<[^>]+>/g, '').trim();
            console.log('  - ' + title);
        });
    } catch (e) {
        console.log('抓取失败: ' + e.message);
    }
    
    console.log('');
    console.log('正在抓取阳江市政府网站...');
    try {
        const html = await fetchUrl('http://www.yangjiang.gov.cn/yj/ywdt/gggs/index.html');
        const matches = html.match(/<a[^>]+>([^<]{10,})<\/a>/g) || [];
        console.log('找到 ' + matches.length + ' 个链接');
        matches.slice(0, 5).forEach(m => {
            const title = m.replace(/<[^>]+>/g, '').trim();
            console.log('  - ' + title);
        });
    } catch (e) {
        console.log('抓取失败: ' + e.message);
    }
}

main();
"

echo.
echo ========================================
echo 测试完成！
echo.
echo 如需完整功能，请部署到 Netlify
echo 详见 部署指南.md
echo ========================================
pause