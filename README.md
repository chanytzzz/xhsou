# xhsou - 小红书搜索 Skill

> 使用 Puppeteer 自动化浏览器搜索小红书，获取真实数据的 Claude Code Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 功能特点

- ✅ **真实浏览器模拟** - 使用 Puppeteer 自动处理签名验证
- ✅ **Cookie 认证** - 支持登录态，提高访问成功率
- ✅ **日期筛选** - 只获取指定日期的内容
- ✅ **批量搜索** - 支持多关键词并行搜索
- ✅ **完整数据** - 获取标题、链接、作者、点赞数、评论数等

## 📦 安装

### 方法1：作为 Claude Code Skill 安装

```bash
# 克隆到 Claude skills 目录
git clone https://github.com/chanytzzz/xhsou.git ~/.claude/skills/xhsou
```

### 方法2：独立使用

```bash
git clone https://github.com/chanytzzz/xhsou.git
cd xhsou
npm install
```

## 🚀 快速开始

### 1. 配置 Cookie

为了提高搜索成功率，建议配置小红书 Cookie：

1. 打开 https://www.xiaohongshu.com 并登录
2. 按 F12 打开开发者工具 → Network 标签
3. 刷新页面，找到任意请求 → Headers → Cookie
4. 复制完整 Cookie 字符串
5. 创建 `.env` 文件：

```bash
XHS_COOKIE=你的Cookie字符串
```

### 2. 使用示例

#### 作为 Node.js 模块

```javascript
import { searchXiaohongshu, searchXhsKeywords } from './src/xhs-crawler.js';

// 搜索单个关键词
const results = await searchXiaohongshu('K12教育', {
  maxResults: 20,
  headless: true
});

// 批量搜索
const batchResults = await searchXhsKeywords(
  ['K12教育', '高途', '作业帮'],
  {
    maxResults: 10,
    headless: true,
    dateFilter: '2026-04-21'  // 可选：只获取指定日期
  }
);
```

#### 命令行使用

```bash
# 搜索单个关键词
node src/cli.js "K12教育"

# 指定日期
node src/cli.js "高途" --date 2026-04-21

# 指定数量
node src/cli.js "作业帮" --max 30

# 可视模式（显示浏览器）
node src/cli.js "学而思" --visible
```

## 📋 API 文档

### `searchXiaohongshu(keyword, options)`

搜索单个关键词

**参数：**
- `keyword` (string) - 搜索关键词
- `options` (object) - 可选配置
  - `maxResults` (number) - 最多返回结果数，默认 20
  - `headless` (boolean) - 是否无头模式，默认 true
  - `dateFilter` (string) - 日期筛选，格式 'YYYY-MM-DD'

**返回值：**
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
    date: "2026-04-22T10:30:00.000Z"
  }
]
```

### `searchXhsKeywords(keywords, options)`

批量搜索多个关键词

**参数：**
- `keywords` (string[]) - 关键词数组
- `options` (object) - 同上

## 🔧 技术原理

### 为什么使用 Puppeteer？

小红书有严格的反爬机制：
- **签名验证**：X-S、X-T 参数需要 JS 动态计算
- **设备指纹**：检测浏览器环境
- **Cookie 验证**：需要登录态

**Puppeteer 的优势：**
- 真实浏览器环境，自动生成签名
- Cookie 注入，模拟登录用户
- 拦截网络请求，获取 API 原始数据

### 工作流程

```
启动 Chrome 浏览器
    ↓
注入用户 Cookie
    ↓
访问小红书搜索页
    ↓
拦截 API 响应 (/api/sns/web/v1/search/notes)
    ↓
解析 JSON 数据
    ↓
返回结构化结果
```

## 📁 项目结构

```
xhsou/
├── src/
│   ├── xhs-crawler.js    # 核心爬虫逻辑
│   └── cli.js            # 命令行工具
├── examples/
│   └── demo.js           # 使用示例
├── skill.md              # Claude Code Skill 文档
├── package.json
├── README.md
└── .env.example
```

## 🎓 使用场景

### 场景1：K12 教育行业简报

```javascript
import { searchXhsKeywords } from './src/xhs-crawler.js';

const keywords = ['K12教育', '高途', '作业帮', '学而思', '好未来'];
const results = await searchXhsKeywords(keywords, { maxResults: 10 });

// 结合 AI 分析生成行业简报
```

### 场景2：竞品监控

```javascript
// 每日定时抓取竞品动态
const competitors = ['竞品A', '竞品B', '竞品C'];
const todayNews = await searchXhsKeywords(competitors, {
  dateFilter: new Date().toISOString().split('T')[0]
});
```

### 场景3：内容研究

```javascript
// 研究某个话题的热门内容
const topic = '春季穿搭';
const hotPosts = await searchXiaohongshu(topic, { maxResults: 50 });

// 分析点赞数、评论数趋势
const avgLikes = hotPosts.reduce((sum, p) => sum + p.likes, 0) / hotPosts.length;
```

## ⚠️ 注意事项

1. **性能考虑**：每次搜索需要启动浏览器，耗时约 3-5 秒/关键词
2. **频率限制**：建议每次搜索后间隔 2 秒，避免被限流
3. **Cookie 有效期**：Cookie 可能过期，需要定期更新
4. **合规使用**：仅用于学习和研究，请遵守小红书使用条款

## 🛠️ 故障排除

### Cookie 失效

**症状**：返回空结果或 401 错误

**解决**：
1. 重新从浏览器获取 Cookie
2. 确保 Cookie 包含所有必需字段（web_session, webId, a1 等）

### 搜索超时

**症状**：长时间无响应

**解决**：
1. 检查网络连接
2. 尝试使用 `headless: false` 查看浏览器状态

### 日期筛选无结果

**症状**：搜索有结果但日期筛选后为空

**解决**：
1. 小红书 API 可能未返回准确时间戳
2. 扩大日期范围或去掉日期筛选

## 📝 开发计划

- [ ] 支持更多筛选条件（按点赞数、评论数排序）
- [ ] 添加代理支持
- [ ] 优化性能（浏览器复用）
- [ ] 支持笔记详情抓取
- [ ] 支持用户主页抓取

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

- GitHub: [@chanytzzz](https://github.com/chanytzzz)

## 🔗 相关资源

- [Puppeteer 文档](https://pptr.dev/)
- [Claude Code](https://claude.ai/code)
- [小红书开放平台](https://open.xiaohongshu.com/)

---

**⭐ 如果这个项目对你有帮助，欢迎 Star！**
