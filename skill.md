---
name: xhsou
version: 1.0.0
description: 使用Puppeteer自动化浏览器搜索小红书，获取K12教育行业相关的真实内容
tags: [crawler, xiaohongshu, xhs, k12, education, puppeteer]
author: chenyt
created: 2026-04-22
user-invocable: true
---

# 小红书搜索工具 (xhsou)

使用Puppeteer自动化浏览器，绕过小红书的反爬机制，获取K12教育行业的真实数据。

## 功能特点

- ✅ 真实浏览器模拟，自动处理签名验证
- ✅ 支持Cookie认证，提高访问成功率
- ✅ 支持日期筛选，只获取指定日期的内容
- ✅ 支持多关键词批量搜索
- ✅ 自动解析API响应，获取标题、链接、作者、点赞数等信息
- ✅ 内容价值智能过滤，区分新闻价值内容与无价值内容

## 使用方法

### 基础用法

```bash
# 搜索单个关键词
node crawler/xhs-puppeteer.js "K12教育"

# 搜索多个关键词（在JS中调用）
import { searchXhsKeywords } from './crawler/xhs-puppeteer.js';

const results = await searchXhsKeywords(['K12教育', '高途', '作业帮'], {
  maxResults: 20,
  headless: true,
  dateFilter: '2026-04-21'  // 可选：只获取指定日期的内容
});
```

### 配置Cookie

为了提高搜索成功率，建议配置小红书Cookie：

1. 打开 https://www.xiaohongshu.com 并登录
2. 按F12打开开发者工具 → Network标签
3. 刷新页面，找到任意请求 → Headers → Cookie
4. 复制完整Cookie字符串
5. 添加到 `.env` 文件：

```bash
XHS_COOKIE=你的Cookie字符串
```

## 集成到K12简报系统

在 `crawler/search.js` 中已集成：

```javascript
import { searchXhsKeywords } from './xhs-puppeteer.js';

// 搜索指定日期的K12相关内容
const xhsResults = await searchXhsKeywords(
  ['K12教育', '高途', '作业帮', '学而思', '好未来'],
  {
    maxResults: 20,
    headless: true,
    dateFilter: '2026-04-21'
  }
);
```

## 参数说明

### searchXiaohongshu(keyword, options)

单个关键词搜索

- `keyword` (string): 搜索关键词
- `options` (object):
  - `maxResults` (number): 最多返回结果数，默认20
  - `headless` (boolean): 是否无头模式，默认true
  - `startDate` (string): 开始日期，格式 'YYYY-MM-DD'，可选
  - `endDate` (string): 结束日期，格式 'YYYY-MM-DD'，可选

**日期筛选逻辑**：
1. 先搜索获取所有结果
2. 读取每条笔记的发布时间
3. 按发布时间降序排序（最新的在前）
4. 根据startDate/endDate筛选
5. 返回指定数量的结果

### searchXhsKeywords(keywords, options)

批量关键词搜索

- `keywords` (string[]): 关键词数组
- `options`: 同上

## 返回数据格式

```javascript
[
  {
    title: "文章标题",
    link: "https://www.xiaohongshu.com/explore/xxxxx",
    snippet: "文章摘要（前200字）",
    author: "作者昵称",
    likes: 1234,          // 点赞数
    comments: 56,         // 评论数
    collects: 89,         // 收藏数
    source: "小红书",
    date: "2026-04-21T10:30:00.000Z",
    publishDate: Date对象,
    rawTimestamp: 1713686400  // 原始时间戳
  }
]
```

## 内容价值过滤规则

⚠️ **重要：此过滤规则仅适用于行业简报场景（如K12教育日报），不适用于趋势分析、内容研究等其他场景。**

生成K12教育行业简报时，按以下规则判断内容新闻价值：

### ✅ 入选类型（高价值内容）

| 类型 | 示例 | 原因 |
|------|------|------|
| **企业战略动作** | 并购、融资、裁员 | 直接影响行业格局 |
| **产品发布** | AI老师、新功能 | 竞品动态 |
| **热点事件** | 员工猝死、裁员争议 | 行业关注度高 |
| **招聘信息** | 小米招K12PM | 反映战略方向 |

### ❌ 不入选类型（无价值内容）

| 类型 | 示例 | 原因 |
|------|------|------|
| **科普文章** | 什么是K12 | 非实时新闻 |
| **个人经验** | 学习方法分享 | 无商业价值 |
| **分析报告** | 竞品分析 | 非一手动态 |

### 具体案例

- ✅ "高途拟收购思之智能" → 企业并购，⭐⭐⭐重要
- ❌ "什么是K12教育" → 科普内容，无新闻价值
- ✅ "高途26岁员工猝死" → 热点事件，社会关注
- ❌ "一天吃透教育行业" → 个人学习笔记

## 使用场景说明

### 场景1：行业简报（Industry Brief）
用于生成K12教育日报等行业动态简报。

**特点**：
- 应用内容价值过滤规则
- 只保留企业动态、产品发布、热点事件、招聘信息
- 过滤科普文章、个人经验、二手分析

**调用示例**：
```javascript
import { analyzeNews } from './processor/ai-analyzer.js';

const analysis = await analyzeNews(searchResults, { 
  mode: 'industry-brief'  // 行业简报模式
});
```

### 场景2：趋势分析（Trend Analysis）
用于摄影趋势、消费趋势等内容研究。

**特点**：
- 不应用内容过滤规则
- 保留所有内容类型（包括个人经验、使用技巧等）
- 关注内容热度和趋势方向

**调用示例**：
```javascript
import { analyzeNews } from './processor/ai-analyzer.js';

const analysis = await analyzeNews(searchResults, { 
  mode: 'trend-analysis'  // 趋势分析模式
});
```

## 注意事项

1. **性能考虑**：每次搜索需要启动浏览器，耗时约3-5秒/关键词
2. **频率限制**：建议每次搜索后间隔2秒，避免被限流
3. **Cookie有效期**：Cookie可能过期，需要定期更新
4. **日期准确性**：小红书API返回的时间戳可能不完全准确
5. **场景选择**：根据使用场景选择合适的分析模式（行业简报 vs 趋势分析）

## 技术实现

### 核心原理

1. 使用Puppeteer启动Chrome浏览器
2. 注入用户Cookie进行认证
3. 访问小红书搜索页面
4. 拦截并捕获搜索API响应 (`/api/sns/web/v1/search/notes`)
5. 解析JSON数据，提取文章信息
6. 按日期筛选（如果指定）

### 文件位置

- 核心实现：`/Users/chenyt/Desktop/k12-daily-brief/crawler/xhs-puppeteer.js`
- 集成入口：`/Users/chenyt/Desktop/k12-daily-brief/crawler/search.js`
- 主流程：`/Users/chenyt/Desktop/k12-daily-brief/index-ai.js`

## 示例：完整工作流

```bash
# 1. 安装依赖
npm install puppeteer

# 2. 配置Cookie（.env文件）
echo "XHS_COOKIE=your_cookie_here" >> .env

# 3. 运行完整简报生成
npm run run:ai

# 输出：
# ✅ 搜索小红书...
# 🔍 搜索小红书: K12教育...
#   日期筛选: 2026-04-21
#   ✓ 找到 9 条结果
#   ✓ 日期筛选后: 3 条结果
# ...
# ✅ 搜索完成！共找到 15 条结果（仅4月21日）
```

## 内容清单生成

生成报告后，可使用 `generateContentManifest` 工具整理所有被引用的内容链接和数据表现：

```javascript
import { generateContentManifest } from './utils/content-manifest.js';

// 生成内容清单
const { manifest, markdown } = generateContentManifest(
  searchResults,  // 搜索结果
  analysis,       // AI分析结果（可选）
  {
    title: '迪卡侬穿搭趋势报告 - 内容来源',
    outputPath: './reports/decathlon-sources.md'
  }
);

// 输出内容：
// 1. JSON格式的数据清单
// 2. Markdown格式的可读清单
// 3. HTML格式的嵌入式组件
```

**清单包含信息**：
- 内容标题和链接
- 作者信息
- 数据表现（点赞、评论、收藏）
- 发布日期
- 是否被用于报告生成

**三种输出格式**：
1. **JSON** - 机器可读，供后续处理
2. **Markdown** - 人类可读，包含表格和详细信息
3. **HTML** - 可嵌入报告页面，折叠式展示

## 扩展能力

可以扩展为通用小红书爬虫：

```javascript
// 搜索任意主题
const fashionResults = await searchXiaohongshu('春季穿搭', {
  maxResults: 50,
  headless: true
});

// 搜索特定日期范围（需要自己实现循环）
const dates = ['2026-04-20', '2026-04-21', '2026-04-22'];
for (const date of dates) {
  const results = await searchXiaohongshu('美妆', { dateFilter: date });
  console.log(`${date}: ${results.length}条`);
}
```

## 故障排除

### Cookie失效

**症状**：返回空结果或401错误

**解决**：
1. 重新从浏览器获取Cookie
2. 确保Cookie包含所有必需字段（web_session, webId, a1等）

### 搜索超时

**症状**：长时间无响应

**解决**：
1. 检查网络连接
2. 增加timeout参数
3. 尝试使用headless: false查看浏览器状态

### 日期筛选无结果

**症状**：搜索有结果但日期筛选后为空

**解决**：
1. 小红书API可能未返回准确时间戳
2. 扩大日期范围或去掉日期筛选
3. 检查返回数据的time字段是否存在

## 相关资源

- [Puppeteer文档](https://pptr.dev/)
- [小红书开放平台](https://open.xiaohongshu.com/)
- K12简报系统：`/Users/chenyt/Desktop/k12-daily-brief/`
