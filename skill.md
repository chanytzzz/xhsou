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
  - `dateFilter` (string): 日期筛选，格式 'YYYY-MM-DD'，可选

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
    likes: 1234,
    comments: 56,
    source: "小红书",
    date: "2026-04-21T10:30:00.000Z",
    publishDate: Date对象
  }
]
```

## 注意事项

1. **性能考虑**：每次搜索需要启动浏览器，耗时约3-5秒/关键词
2. **频率限制**：建议每次搜索后间隔2秒，避免被限流
3. **Cookie有效期**：Cookie可能过期，需要定期更新
4. **日期准确性**：小红书API返回的时间戳可能不完全准确

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
