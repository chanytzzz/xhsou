import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 简化版小红书爬虫 - 使用Puppeteer
 */
async function searchXiaohongshu(keyword, options = {}) {
  const { maxResults = 20, headless = true } = options;

  console.log(`🔍 搜索小红书: ${keyword}...`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 设置Cookie
    const cookieString = process.env.XHS_COOKIE;
    if (cookieString) {
      const cookies = cookieString.split(';').map(cookie => {
        const [name, ...valueParts] = cookie.trim().split('=');
        return {
          name: name.trim(),
          value: valueParts.join('=').trim(),
          domain: '.xiaohongshu.com'
        };
      });
      await page.setCookie(...cookies);
    }

    // 监听API响应
    let apiResponse = null;
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/sns/web/v1/search/notes')) {
        console.log('  检测到API请求:', url);
        try {
          const data = await response.json();
          apiResponse = data;
          console.log('  API返回数据:', data.data?.items?.length || 0, '条');
        } catch (e) {
          console.log('  API解析失败:', e.message);
        }
      }
    });

    // 访问搜索页
    console.log('  访问搜索页...');
    const searchUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // 等待加载
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 等待API响应
    let retries = 0;
    while (!apiResponse && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      retries++;
    }

    await browser.close();

    if (!apiResponse || !apiResponse.data || !apiResponse.data.items) {
      console.log('  ⚠️  未获取到数据');
      return [];
    }

    // 解析数据
    const items = apiResponse.data.items || [];
    console.log('  开始解析', items.length, '条数据...');

    const results = items.slice(0, maxResults).map((item, idx) => {
      const note = item.note_card || item || {};
      const user = note.user || {};
      const interact = note.interact_info || {};
      const noteId = note.note_id || note.id || item.id || '';

      const result = {
        title: note.display_title || note.title || '',
        link: noteId ? `https://www.xiaohongshu.com/explore/${noteId}` : '',
        snippet: (note.desc || '').substring(0, 200),
        author: user.nickname || '',
        likes: interact.liked_count || 0,
        comments: interact.comment_count || 0,
        source: '小红书',
        date: new Date().toISOString()
      };

      if (idx === 0) {
        console.log('  第1条数据示例:', JSON.stringify({
          title: result.title,
          hasLink: !!result.link,
          noteId: noteId
        }));
      }

      return result;
    }).filter(item => item.title && item.link);

    console.log(`  ✓ 找到 ${results.length} 条结果`);
    return results;

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error(`  ✗ 小红书搜索失败: ${error.message}`);
    return [];
  }
}

/**
 * 批量搜索
 */
async function searchXhsKeywords(keywords, options = {}) {
  const allResults = [];

  for (const keyword of keywords) {
    const results = await searchXiaohongshu(keyword, options);
    allResults.push(...results);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return allResults;
}

export { searchXiaohongshu, searchXhsKeywords };
