#!/usr/bin/env node

/**
 * xhsou CLI - 小红书搜索命令行工具
 */

import { searchXhsKeywords } from './xhs-crawler.js';
import fs from 'fs/promises';

// 解析命令行参数
const args = process.argv.slice(2);
const keywords = [];
let maxResults = 20;
let dateFilter = null;
let headless = true;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--date' || arg === '-d') {
    dateFilter = args[++i];
  } else if (arg === '--max' || arg === '-m') {
    maxResults = parseInt(args[++i]);
  } else if (arg === '--visible' || arg === '-v') {
    headless = false;
  } else if (arg === '--help' || arg === '-h') {
    showHelp();
    process.exit(0);
  } else if (!arg.startsWith('-')) {
    keywords.push(arg);
  }
}

if (keywords.length === 0) {
  console.error('❌ 错误：请提供至少一个搜索关键词');
  showHelp();
  process.exit(1);
}

function showHelp() {
  console.log(`
小红书搜索工具 (xhsou)

使用方法：
  xhsou <关键词...> [选项]

示例：
  xhsou "K12教育"                        # 搜索K12教育相关内容
  xhsou "K12教育" --date 2026-04-21     # 只搜索4月21日的内容
  xhsou "高途" "作业帮" --max 30         # 搜索多个关键词，最多30条结果
  xhsou "学而思" --visible               # 可视模式（显示浏览器）

选项：
  -d, --date <日期>      只搜索指定日期的内容（格式：YYYY-MM-DD）
  -m, --max <数量>       最多返回结果数（默认：20）
  -v, --visible          可视模式，显示浏览器窗口
  -h, --help             显示帮助信息

配置：
  请在 .env 文件中配置 XHS_COOKIE 以提高成功率
  `);
}

// 执行搜索
console.log('🔍 开始搜索小红书...\n');
console.log(`关键词: ${keywords.join(', ')}`);
if (dateFilter) console.log(`日期筛选: ${dateFilter}`);
console.log(`最多结果: ${maxResults}条`);
console.log('');

searchXhsKeywords(keywords, {
  maxResults,
  headless,
  dateFilter
})
  .then(async results => {
    console.log('\n' + '='.repeat(60));
    console.log(`✅ 搜索完成！共找到 ${results.length} 条结果`);
    console.log('='.repeat(60));
    console.log('');

    if (results.length === 0) {
      console.log('💡 提示：');
      console.log('  1. 尝试更换关键词');
      console.log('  2. 去掉日期筛选（如果使用了）');
      console.log('  3. 检查 XHS_COOKIE 是否配置正确');
      return;
    }

    results.forEach((item, i) => {
      console.log(`${i + 1}. ${item.title}`);
      console.log(`   作者: ${item.author} | 点赞: ${item.likes} | 评论: ${item.comments || 0}`);
      console.log(`   链接: ${item.link}`);
      console.log(`   时间: ${new Date(item.date).toLocaleString('zh-CN')}`);
      if (item.snippet) {
        console.log(`   摘要: ${item.snippet.substring(0, 100)}...`);
      }
      console.log('');
    });

    // 导出JSON
    const outputFile = `xhsou-${Date.now()}.json`;
    await fs.writeFile(outputFile, JSON.stringify(results, null, 2));
    console.log(`📄 完整结果已保存: ${outputFile}`);
  })
  .catch(error => {
    console.error('❌ 搜索失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
