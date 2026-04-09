# YouTube 视频功能使用指南

## 🎬 新增功能

### 1. 视频播放器
- 点击内容目录中的任意视频即可播放
- 嵌入式 YouTube 播放器
- 支持全屏播放
- 一键在 YouTube 打开

### 2. 视频收藏
- 播放视频时点击❤️图标收藏
- 在应用页面的 "Favorite videos" 标签查看收藏
- 管理和删除收藏的视频

### 3. 视频搜索和管理（需要 API Key）
- 访问 `/admin` 页面
- 搜索 YouTube 视频
- 通过 URL 直接添加视频
- 一键复制视频配置代码

---

## 🔑 配置 YouTube API（可选）

### 步骤 1：获取 API Key

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **YouTube Data API v3**
4. 创建凭据 → API 密钥
5. 复制 API 密钥

### 步骤 2：配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=你的API密钥
```

### 步骤 3：重启开发服务器

```bash
npm run dev
```

---

## 📖 使用方法

### 方法 1：直接播放（无需 API）

1. 访问 `/catalog` 内容目录
2. 点击任意视频卡片
3. 视频播放器自动打开
4. 点击❤️收藏视频

### 方法 2：搜索添加（需要 API）

1. 访问 `/admin` 管理页面
2. 在搜索框输入关键词，如 "English conversation"
3. 点击"搜索"按钮
4. 浏览搜索结果
5. 点击"复制代码"获取视频配置
6. 打开 `lib/content-data.ts`
7. 将代码粘贴到 `mockYouTubeContent` 数组中
8. 手动设置 `difficulty` 和 `category`

### 方法 3：URL 添加（需要 API）

1. 在 YouTube 找到想添加的视频
2. 复制视频 URL（如 `https://www.youtube.com/watch?v=dQw4w9WgXcQ`）
3. 访问 `/admin` 管理页面
4. 粘贴 URL 到输入框
5. 点击"添加"按钮
6. 点击"复制代码"
7. 按照方法 2 的步骤 6-8 操作

---

## 🎯 功能特性

### 视频播放器
- ✅ 嵌入式 YouTube 播放器
- ✅ 全屏支持
- ✅ 自动播放控制
- ✅ 收藏功能
- ✅ 在 YouTube 打开
- ✅ 学习提示

### 视频收藏
- ✅ 一键收藏/取消收藏
- ✅ 收藏列表管理
- ✅ 本地存储（localStorage）
- ✅ 显示收藏日期
- ✅ 快速播放

### 视频搜索（需要 API）
- ✅ 关键词搜索
- ✅ URL 直接添加
- ✅ 自动获取视频信息
- ✅ 缩略图预览
- ✅ 一键复制配置代码

---

## 📝 添加视频示例

### 复制的代码格式：

```typescript
{
  id: 'yt-1234567890',
  title: 'English Conversation Practice',
  thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  duration: '15:30',
  views: '2.5M',
  difficulty: 'intermediate',  // 手动设置：beginner | intermediate | advanced
  channel: 'English with Lucy',
  category: 'Conversation'  // 手动设置：选择现有分类
},
```

### 粘贴位置：

打开 `lib/content-data.ts`，找到 `mockYouTubeContent` 数组：

```typescript
export const mockYouTubeContent: ContentItem[] = [
  // 现有视频...
  
  // 粘贴新视频代码到这里
  {
    id: 'yt-1234567890',
    title: 'English Conversation Practice',
    // ...
  },
];
```

---

## 🎨 可用分类

- Conversation（对话）
- Business（商务）
- Pronunciation（发音）
- Stories（故事）
- Test Prep（考试准备）
- Vocabulary（词汇）
- Grammar（语法）
- News（新闻）

---

## 💡 使用技巧

### 1. 无 API 使用
即使没有 YouTube API Key，你仍然可以：
- 播放现有视频
- 收藏视频
- 手动添加视频（按照 YOUTUBE_GUIDE.md 的方法 1）

### 2. 有 API 使用
配置 API Key 后，你可以：
- 搜索任意 YouTube 视频
- 自动获取视频信息
- 快速批量添加视频

### 3. 学习建议
- 收藏感兴趣的视频
- 观看时记录生词
- 使用文本阅读器学习字幕
- 定期复习收藏的视频

---

## 🔧 故障排除

### 问题 1：搜索功能不工作
**原因**：未配置 YouTube API Key  
**解决**：按照上面的步骤配置 API Key

### 问题 2：视频无法播放
**原因**：视频可能被删除或设置为私密  
**解决**：尝试在 YouTube 打开视频，确认视频可用

### 问题 3：API 配额用完
**原因**：YouTube API 有每日配额限制（免费 10,000 单位/天）  
**解决**：等待第二天配额重置，或升级 API 配额

### 问题 4：收藏丢失
**原因**：清除了浏览器数据  
**解决**：收藏存储在 localStorage，建议定期导出重要视频列表

---

## 📊 API 配额说明

YouTube Data API v3 配额：
- 免费配额：10,000 单位/天
- 搜索操作：100 单位/次
- 视频详情：1 单位/次

**建议**：
- 每天搜索不超过 50 次
- 优先使用 URL 添加（消耗更少）
- 批量添加时一次性完成

---

## 🚀 下一步

1. **配置 API Key** - 解锁搜索功能
2. **添加更多视频** - 丰富学习资源
3. **收藏喜欢的视频** - 建立个人学习库
4. **结合文本阅读器** - 深度学习视频内容

---

需要帮助？查看 [YOUTUBE_GUIDE.md](./YOUTUBE_GUIDE.md) 获取更多详细信息。
