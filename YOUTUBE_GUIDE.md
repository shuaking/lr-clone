# 添加 YouTube 学习资源指南

## 📝 方法 1：手动添加（推荐，简单快速）

### 步骤 1：找到你想添加的 YouTube 视频

访问 YouTube，找到优质的英语学习视频，例如：
- https://www.youtube.com/watch?v=dQw4w9WgXcQ

### 步骤 2：获取视频信息

从 YouTube 视频页面获取：
- **视频 ID**: URL 中的 `v=` 后面的部分（如 `dQw4w9WgXcQ`）
- **标题**: 视频标题
- **频道名**: 频道名称
- **时长**: 视频时长
- **观看次数**: 大致观看次数

### 步骤 3：获取缩略图 URL

YouTube 缩略图 URL 格式：
```
https://img.youtube.com/vi/[VIDEO_ID]/maxresdefault.jpg
```

例如：
```
https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg
```

备用格式（如果 maxresdefault 不存在）：
```
https://img.youtube.com/vi/[VIDEO_ID]/hqdefault.jpg
```

### 步骤 4：编辑 content-data.ts

打开 `lib/content-data.ts`，在 `mockYouTubeContent` 数组中添加新视频：

```typescript
export const mockYouTubeContent: ContentItem[] = [
  // 现有视频...
  
  // 添加你的新视频
  {
    id: 'yt-7',  // 递增 ID
    title: 'English Grammar Basics for Beginners',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '25:30',
    views: '1.5M',
    difficulty: 'beginner',  // beginner | intermediate | advanced
    channel: 'English Lessons 4U',
    category: 'Grammar'  // 选择现有分类或创建新分类
  },
];
```

### 步骤 5：添加新分类（可选）

如果你想添加新的分类，编辑 `categories` 数组：

```typescript
export const categories = [
  'All',
  'Conversation',
  'Business',
  'Pronunciation',
  'Stories',
  'Test Prep',
  'Vocabulary',
  'Grammar',
  'News',
  'Culture',  // 新分类
  'Slang'     // 新分类
];
```

---

## 🤖 方法 2：使用 YouTube API（高级，自动化）

### 步骤 1：获取 YouTube API Key

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目
3. 启用 YouTube Data API v3
4. 创建 API 凭据（API Key）

### 步骤 2：创建 YouTube API 工具

创建 `lib/youtube-api.ts`：

```typescript
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  channel: string;
}

/**
 * 获取视频详情
 */
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }
    
    const video = data.items[0];
    
    return {
      id: videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
      duration: formatDuration(video.contentDetails.duration),
      views: formatViews(video.statistics.viewCount),
      channel: video.snippet.channelTitle
    };
  } catch (error) {
    console.error('Failed to fetch video details:', error);
    return null;
  }
}

/**
 * 搜索视频
 */
export async function searchVideos(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    
    const data = await response.json();
    
    if (!data.items) {
      return [];
    }
    
    // 获取每个视频的详细信息
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    
    const detailsData = await detailsResponse.json();
    
    return detailsData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high.url,
      duration: formatDuration(video.contentDetails.duration),
      views: formatViews(video.statistics.viewCount),
      channel: video.snippet.channelTitle
    }));
  } catch (error) {
    console.error('Failed to search videos:', error);
    return [];
  }
}

/**
 * 格式化时长（ISO 8601 -> MM:SS）
 */
function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  if (!match) return '0:00';
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 格式化观看次数
 */
function formatViews(views: string): string {
  const num = parseInt(views);
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return num.toString();
}
```

### 步骤 3：配置环境变量

在 `.env.local` 中添加：

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
```

### 步骤 4：创建管理界面（可选）

创建 `app/admin/page.tsx`：

```typescript
"use client";

import { useState } from "react";
import { getVideoDetails } from "@/lib/youtube-api";

export default function AdminPage() {
  const [videoId, setVideoId] = useState("");
  const [videoData, setVideoData] = useState(null);

  const handleFetch = async () => {
    const data = await getVideoDetails(videoId);
    setVideoData(data);
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-semibold mb-6">添加 YouTube 视频</h1>
      
      <div className="space-y-4">
        <input
          type="text"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          placeholder="输入 YouTube 视频 ID"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
        />
        
        <button
          onClick={handleFetch}
          className="rounded-full bg-white px-6 py-3 font-medium text-slate-900"
        >
          获取视频信息
        </button>
        
        {videoData && (
          <pre className="rounded-2xl bg-white/5 p-4 text-sm">
            {JSON.stringify(videoData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 推荐的 YouTube 频道

### 初级（Beginner）
- **English with Lucy** - 日常对话和基础语法
- **Learn English with EnglishClass101.com** - 系统化课程
- **Easy English** - 街头采访，真实对话

### 中级（Intermediate）
- **Rachel's English** - 发音和口音训练
- **English Addict with Mr Duncan** - 生动有趣的课程
- **BBC Learning English** - 新闻和文化

### 高级（Advanced）
- **Business English Pod** - 商务英语
- **TED-Ed** - 教育性内容
- **Crash Course** - 学术英语

---

## 📋 快速添加模板

复制这个模板，填入你的视频信息：

```typescript
{
  id: 'yt-X',  // 改成下一个数字
  title: '视频标题',
  thumbnail: 'https://img.youtube.com/vi/视频ID/maxresdefault.jpg',
  duration: 'MM:SS',
  views: 'X.XM',
  difficulty: 'beginner',  // beginner | intermediate | advanced
  channel: '频道名称',
  category: 'Conversation'  // 选择分类
}
```

---

## 💡 提示

1. **缩略图质量**: 优先使用 `maxresdefault.jpg`，如果不存在则用 `hqdefault.jpg`
2. **分类一致性**: 使用现有分类，避免创建太多新分类
3. **难度评估**: 根据视频内容和语速判断难度
4. **观看次数**: 可以四舍五入，不需要精确数字
5. **定期更新**: 建议每周添加 5-10 个新视频

---

## 🔄 批量添加示例

```typescript
const newVideos = [
  {
    id: 'yt-7',
    title: '10 Common English Mistakes',
    thumbnail: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg',
    duration: '12:30',
    views: '2.1M',
    difficulty: 'intermediate',
    channel: 'English Lessons 4U',
    category: 'Grammar'
  },
  {
    id: 'yt-8',
    title: 'Business Meeting English',
    thumbnail: 'https://img.youtube.com/vi/def456/maxresdefault.jpg',
    duration: '18:45',
    views: '890K',
    difficulty: 'advanced',
    channel: 'Business English Pod',
    category: 'Business'
  },
  // 添加更多...
];

// 合并到现有数组
export const mockYouTubeContent: ContentItem[] = [
  ...existingVideos,
  ...newVideos
];
```

---

需要我帮你添加具体的视频吗？或者你想使用 YouTube API 方法？
