import { searchXiaohongshu, searchXhsKeywords } from '../src/xhs-crawler.js';

/**
 * 示例1：搜索单个关键词
 */
async function example1() {
  console.log('='.repeat(60));
  console.log('示例1：搜索单个关键词');
  console.log('='.repeat(60));

  const results = await searchXiaohongshu('K12教育', {
    maxResults: 5,
    headless: true
  });

  console.log(`找到 ${results.length} 条结果：\n`);
  results.forEach((item, i) => {
    console.log(`${i + 1}. ${item.title}`);
    console.log(`   链接: ${item.link}`);
    console.log(`   作者: ${item.author} | 点赞: ${item.likes}`);
    console.log('');
  });
}

/**
 * 示例2：批量搜索多个关键词
 */
async function example2() {
  console.log('='.repeat(60));
  console.log('示例2：批量搜索多个关键词');
  console.log('='.repeat(60));

  const keywords = ['高途', '作业帮', '学而思'];
  const results = await searchXhsKeywords(keywords, {
    maxResults: 3,
    headless: true
  });

  console.log(`共找到 ${results.length} 条结果：\n`);

  // 按来源分组
  const byKeyword = {};
  results.forEach(item => {
    keywords.forEach(kw => {
      if (item.title.includes(kw) || item.snippet.includes(kw)) {
        if (!byKeyword[kw]) byKeyword[kw] = [];
        byKeyword[kw].push(item);
      }
    });
  });

  Object.entries(byKeyword).forEach(([kw, items]) => {
    console.log(`【${kw}】- ${items.length}条`);
    items.forEach(item => {
      console.log(`  - ${item.title} (${item.likes}👍)`);
    });
    console.log('');
  });
}

/**
 * 示例3：指定日期搜索
 */
async function example3() {
  console.log('='.repeat(60));
  console.log('示例3：指定日期搜索');
  console.log('='.repeat(60));

  const today = new Date().toISOString().split('T')[0];

  const results = await searchXiaohongshu('教育', {
    maxResults: 5,
    headless: true,
    dateFilter: today
  });

  console.log(`今日 (${today}) 找到 ${results.length} 条结果\n`);
}

/**
 * 示例4：分析热门内容
 */
async function example4() {
  console.log('='.repeat(60));
  console.log('示例4：分析热门内容');
  console.log('='.repeat(60));

  const results = await searchXiaohongshu('K12教育', {
    maxResults: 20,
    headless: true
  });

  // 统计分析
  const totalLikes = results.reduce((sum, item) => sum + item.likes, 0);
  const avgLikes = Math.round(totalLikes / results.length);
  const maxLikes = Math.max(...results.map(item => item.likes));

  console.log(`数据统计：`);
  console.log(`  总数: ${results.length}条`);
  console.log(`  总点赞: ${totalLikes}`);
  console.log(`  平均点赞: ${avgLikes}`);
  console.log(`  最高点赞: ${maxLikes}`);
  console.log('');

  // 最热门的3条
  const top3 = results
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);

  console.log('最热门的3条：\n');
  top3.forEach((item, i) => {
    console.log(`${i + 1}. ${item.title} - ${item.likes}👍`);
    console.log(`   ${item.link}`);
    console.log('');
  });
}

// 运行示例
async function main() {
  try {
    await example1();
    console.log('\n\n');

    await example2();
    console.log('\n\n');

    // 以下示例可根据需要启用
    // await example3();
    // await example4();

  } catch (error) {
    console.error('示例运行失败:', error.message);
    console.error(error.stack);
  }
}

main();
