# 如何添加真实的英语学习视频

## 方法 1：手动添加（无需 API Key）

### 步骤 1：找到 YouTube 视频

1. 访问 YouTube.com
2. 搜索英语学习视频（如 "English conversation", "English grammar" 等）
3. 找到合适的视频后，复制视频 URL

### 步骤 2：提取视频 ID

从 URL 中提取视频 ID：

**URL 格式示例：**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
                                 ^^^^^^^^^^^
                                 这是视频 ID
```

**其他格式：**
- `https://youtu.be/dQw4w9WgXcQ` → ID 是 `dQw4w9WgXcQ`
- `https://www.youtube.com/embed/dQw4w9WgXcQ` → ID 是 `dQw4w9WgXcQ`

### 步骤 3：编辑配置文件

打开 `lib/content-data.ts`，添加视频：

```typescript
export const mockYouTubeContent: ContentItem[] = [
  {
    id: 'dQw4w9WgXcQ',  // 替换为真实的视频 ID
    title: '视频标题',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',  // 替换 ID
    duration: '3:33',
    views: '1.4B',
    difficulty: 'beginner',  // beginner | intermediate | advanced
    channel: '频道名称',
    category: 'Conversation'  // 选择分类
  },
  // 添加更多视频...
];
```

### 步骤 4：可用的分类

```typescript
- 'Conversation'   // 对话
- 'Business'       // 商务
- 'Pronunciation'  // 发音
- 'Stories'        // 故事
- 'Test Prep'      // 考试准备
- 'Vocabulary'     // 词汇
- 'Grammar'        // 语法
- 'News'           // 新闻
```

---

## 方法 2：使用管理页面（需要 API Key）

### 步骤 1：配置 YouTube API Key

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建项目并启用 **YouTube Data API v3**
3. 创建 API 密钥
4. 在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=你的API密钥
```

5. 重启开发服务器：`npm run dev`

### 步骤 2：使用管理页面

1. 访问 `http://localhost:3000/admin`
2. 输入密码：`admin`
3. 搜索视频或粘贴 YouTube URL
4. 点击"复制代码"
5. 粘贴到 `lib/content-data.ts`

---

## 推荐的英语学习频道

### 初学者 (Beginner)
- **English with Lucy** - 日常对话和基础语法
- **Learn English with EnglishClass101.com** - 系统化课程
- **Easy English** - 街头采访，真实对话

### 中级 (Intermediate)
- **BBC Learning English** - 新闻和文化
- **Rachel's English** - 发音和口音
- **English Addict with Mr Duncan** - 生动有趣的课程

### 高级 (Advanced)
- **TED-Ed** - 教育性演讲
- **Business English Pod** - 商务英语
- **IELTS Official** - 考试准备

---

## 注意事项

### ⚠️ 视频嵌入限制

某些 YouTube 视频禁止嵌入，会显示 "Video unavailable"。

**解决方法：**
1. 在 YouTube 上测试视频是否允许嵌入
2. 选择其他相似的视频
3. 优先选择教育类频道的视频（通常允许嵌入）

### ✅ 如何测试视频是否可嵌入

在浏览器控制台运行：
```javascript
fetch('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=视频ID')
  .then(r => r.json())
  .then(d => console.log('可以嵌入:', d))
  .catch(e => console.log('无法嵌入'))
```

---

## 快速示例

### 添加一个真实的英语学习视频

```typescript
{
  id: 'Mun13A6eS_A',  // 真实的视频 ID
  title: 'Daily English Conversation - Learn to speak English Fluently',
  thumbnail: 'https://img.youtube.com/vi/Mun13A6eS_A/hqdefault.jpg',
  duration: '3:00:00',
  views: '15M',
  difficulty: 'beginner',
  channel: 'Learn English with EnglishClass101.com',
  category: 'Conversation'
}
```

---

## 故障排除

### 问题 1：视频无法播放
**原因**：视频禁止嵌入或已被删除  
**解决**：更换其他视频

### 问题 2：缩略图不显示
**原因**：视频 ID 错误  
**解决**：检查 ID 是否正确

### 问题 3：管理页面搜索不工作
**原因**：未配置 API Key  
**解决**：按照方法 2 配置 API Key

---

## 下一步

1. 替换测试视频为真实的英语学习视频
2. 按难度和分类组织视频
3. 定期更新视频内容
4. 收藏喜欢的视频

需要帮助？查看 [VIDEO_FEATURES.md](./VIDEO_FEATURES.md) 了解更多功能。
