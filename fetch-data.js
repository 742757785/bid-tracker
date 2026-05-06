const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

// 抓取网页
async function fetchPage(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
            },
            timeout: 15000
        });
        return await response.text();
    } catch (error) {
        console.error(`抓取失败 ${url}:`, error.message);
        return null;
    }
}

// 解析茂名市政府
async function parseMaomingGov() {
    const bids = [];
    const html = await fetchPage('http://www.maoming.gov.cn/zwgk/gsgg/index.html');
    if (!html) return bids;
    
    const $ = cheerio.load(html);
    $('li a').each((i, el) => {
        const title = $(el).text().trim();
        let url = $(el).attr('href') || '';
        
        if (title.length > 5 && title.length < 200) {
            if (url && !url.startsWith('http')) {
                url = 'http://www.maoming.gov.cn' + (url.startsWith('/') ? '' : '/') + url;
            }
            
            const dateEl = $(el).parent().find('span');
            const date = dateEl.text().trim() || '';
            
            bids.push({
                title,
                url,
                source: '茂名市政府',
                region: '茂名',
                date,
                category: guessCategory(title)
            });
        }
    });
    
    console.log(`茂名市政府: ${bids.length} 条`);
    return bids;
}

// 解析阳江市政府
async function parseYangjiangGov() {
    const bids = [];
    const html = await fetchPage('http://www.yangjiang.gov.cn/yj/ywdt/gggs/index.html');
    if (!html) return bids;
    
    const $ = cheerio.load(html);
    $('li a').each((i, el) => {
        const title = $(el).text().trim();
        let url = $(el).attr('href') || '';
        
        if (title.length > 5 && title.length < 200) {
            if (url && !url.startsWith('http')) {
                url = 'http://www.yangjiang.gov.cn' + (url.startsWith('/') ? '' : '/') + url;
            }
            
            const dateEl = $(el).parent().find('span');
            const date = dateEl.text().trim() || '';
            
            bids.push({
                title,
                url,
                source: '阳江市政府',
                region: '阳江',
                date,
                category: guessCategory(title)
            });
        }
    });
    
    console.log(`阳江市政府: ${bids.length} 条`);
    return bids;
}

// 解析茂名市财政局
async function parseMaomingFinance() {
    const bids = [];
    const html = await fetchPage('http://czj.maoming.gov.cn/');
    if (!html) return bids;
    
    const $ = cheerio.load(html);
    $('a').each((i, el) => {
        const title = $(el).text().trim();
        let url = $(el).attr('href') || '';
        
        if ((title.includes('采购') || title.includes('招标')) && title.length > 5) {
            if (url && !url.startsWith('http')) {
                url = 'http://czj.maoming.gov.cn' + (url.startsWith('/') ? '' : '/') + url;
            }
            
            bids.push({
                title,
                url,
                source: '茂名市财政局',
                region: '茂名',
                date: '',
                category: '采购'
            });
        }
    });
    
    console.log(`茂名市财政局: ${bids.length} 条`);
    return bids;
}

// 解析阳江市公共资源交易中心
async function parseYangjiangGGZY() {
    const bids = [];
    const html = await fetchPage('https://jy.yjggzy.cn:8088/');
    if (!html) return bids;
    
    const $ = cheerio.load(html);
    $('a').each((i, el) => {
        const title = $(el).text().trim();
        let url = $(el).attr('href') || '';
        
        if (title.length > 5 && title.length < 200) {
            if (url && !url.startsWith('http')) {
                url = 'https://jy.yjggzy.cn:8088' + (url.startsWith('/') ? '' : '/') + url;
            }
            
            bids.push({
                title,
                url,
                source: '阳江市公共资源交易中心',
                region: '阳江',
                date: '',
                category: guessCategory(title)
            });
        }
    });
    
    console.log(`阳江市公共资源交易中心: ${bids.length} 条`);
    return bids;
}

// 猜测类别
function guessCategory(title) {
    if (/工程|施工|建设|改造|维修|装修/.test(title)) return '工程';
    if (/采购|购买|设备|物资|购置/.test(title)) return '采购';
    if (/服务|咨询|监理|设计|检测/.test(title)) return '服务';
    return '其他';
}

// 主函数
async function main() {
    console.log('开始抓取招标信息...');
    console.log('时间:', new Date().toLocaleString('zh-CN'));
    
    let allBids = [];
    
    // 并行抓取
    const results = await Promise.allSettled([
        parseMaomingGov(),
        parseYangjiangGov(),
        parseMaomingFinance(),
        parseYangjiangGGZY()
    ]);
    
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            allBids = allBids.concat(result.value);
        }
    });
    
    // 去重
    const uniqueBids = [];
    const seen = new Set();
    allBids.forEach(bid => {
        const key = bid.title + bid.url;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueBids.push(bid);
        }
    });
    
    // 添加ID和时间戳
    const data = {
        updateTime: new Date().toISOString(),
        updateTimeCN: new Date().toLocaleString('zh-CN'),
        count: uniqueBids.length,
        bids: uniqueBids.map((bid, index) => ({
            id: index + 1,
            ...bid
        }))
    };
    
    // 保存到文件
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf-8');
    
    console.log(`\n抓取完成!`);
    console.log(`共 ${data.count} 条招标信息`);
    console.log(`数据已保存到 data.json`);
}

main().catch(console.error);