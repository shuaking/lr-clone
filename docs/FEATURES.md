# 功能设计文档

> 详细的技术设计和实现方案

---

## 1. 词汇管理系统

### 1.1 需求概述

**用户故事**：
- 作为学习者，我想保存遇到的生词，以便后续复习
- 作为学习者，我想看到单词的上下文，帮助记忆
- 作为学习者，我想知道这个词是从哪个视频学到的

**核心价值**：
- 将被动观看转化为主动学习
- 建立个人词汇库
- 提供复习的基础数据

### 1.2 数据模型

#### LocalStorage 版本（Phase 1）

```typescript
interface VocabularyItem {
  id: string;                    // UUID
  word: string;                  // 原始单词
  translation: string;           // 翻译
  context: string;               // 完整句子上下文
  videoId: string;               // YouTube 视频 ID
  videoTitle: string;            // 视频标题
  timestamp: number;             // 视频时间戳（秒）
  savedAt: number;               // 保存时间戳（毫秒）
  notes?: string;                // 用户笔记（可选）
  mastery?: 'learning' | 'familiar' | 'mastered'; // 掌握程度
  reviewCount?: number;          // 复习次数
  lastReviewedAt?: number;       // 最后复习时间
}

// 存储键
const VOCABULARY_STORAGE_KEY = 'lr_vocabulary';

// 存储结构
{
  "lr_vocabulary": [
    { id: "uuid-1", word: "serendipity", ... },
    { id: "uuid-2", word: "ephemeral", ... }
  ]
}
```

#### 数据库版本（Phase 2）

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 词汇表
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL,
  translation TEXT NOT NULL,
  context TEXT NOT NULL,
  video_id VARCHAR(50) NOT NULL,
  video_title VARCHAR(255),
  timestamp DECIMAL(10, 2),
  saved_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  mastery VARCHAR(20) DEFAULT 'learning',
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP,
  
  -- 索引
  INDEX idx_user_word (user_id, word),
  INDEX idx_saved_at (saved_at DESC)
);
```

### 1.3 API 设计

#### 保存单词

```typescript
// POST /api/vocabulary
interface SaveVocabularyRequest {
  word: string;
  translation: string;
  context: string;
  videoId: string;
  videoTitle: string;
  timestamp: number;
}

interface SaveVocabularyResponse {
  success: boolean;
  data: VocabularyItem;
  message?: string;
}
```

#### 获取词汇列表

```typescript
// GET /api/vocabulary?sort=date&order=desc&search=hello
interface GetVocabularyRequest {
  sort?: 'date' | 'word' | 'mastery';
  order?: 'asc' | 'desc';
  search?: string;
  limit?: number;
  offset?: number;
}

interface GetVocabularyResponse {
  success: boolean;
  data: VocabularyItem[];
  total: number;
  hasMore: boolean;
}
```

#### 更新单词

```typescript
// PATCH /api/vocabulary/:id
interface UpdateVocabularyRequest {
  notes?: string;
  mastery?: 'learning' | 'familiar' | 'mastered';
}
```

#### 删除单词

```typescript
// DELETE /api/vocabulary/:id
interface DeleteVocabularyResponse {
  success: boolean;
  message: string;
}
```

### 1.4 UI 组件设计

#### 保存按钮（在 WordPopup 中）

```tsx
// components/word-popup.tsx 修改
<button
  onClick={handleSaveWord}
  className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2"
>
  {isSaved ? (
    <>
      <BookmarkCheck size={16} />
      <span>已保存</span>
    </>
  ) : (
    <>
      <BookmarkPlus size={16} />
      <span>保存单词</span>
    </>
  )}
</button>
```

#### 词汇列表页面

```tsx
// app/vocabulary/page.tsx
export default function VocabularyPage() {
  return (
    <div className="container mx-auto p-6">
      {/* 顶部工具栏 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">我的词汇表</h1>
        <div className="flex gap-4">
          {/* 搜索框 */}
          <input
            type="text"
            placeholder="搜索单词..."
            className="rounded-lg border px-4 py-2"
          />
          {/* 排序选择 */}
          <select className="rounded-lg border px-4 py-2">
            <option value="date">按日期</option>
            <option value="word">按字母</option>
            <option value="mastery">按掌握程度</option>
          </select>
          {/* 导出按钮 */}
          <button className="rounded-lg bg-brand px-4 py-2">
            导出
          </button>
        </div>
      </div>

      {/* 词汇卡片网格 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vocabulary.map((item) => (
          <VocabularyCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

#### 词汇卡片组件

```tsx
// components/vocabulary-card.tsx
interface VocabularyCardProps {
  item: VocabularyItem;
}

export function VocabularyCard({ item }: VocabularyCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      {/* 单词 */}
      <h3 className="text-xl font-bold text-white">{item.word}</h3>
      
      {/* 翻译 */}
      <p className="mt-2 text-muted">{item.translation}</p>
      
      {/* 上下文 */}
      <p className="mt-3 text-sm italic text-muted/70">
        "{item.context}"
      </p>
      
      {/* 元信息 */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>{formatDate(item.savedAt)}</span>
        <span>{item.videoTitle}</span>
      </div>
      
      {/* 操作按钮 */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => goToVideo(item.videoId, item.timestamp)}
          className="flex-1 rounded-lg bg-brand/20 px-3 py-2 text-sm"
        >
          回到视频
        </button>
        <button
          onClick={() => deleteWord(item.id)}
          className="rounded-lg bg-red-500/20 px-3 py-2 text-sm"
        >
          删除
        </button>
      </div>
    </div>
  );
}
```

### 1.5 实现步骤

**Step 1: 数据层**（30 分钟）
1. 创建 `lib/vocabulary.ts`
2. 实现 localStorage CRUD 操作
3. 添加数据验证和错误处理

**Step 2: UI 组件**（45 分钟）
1. 修改 `WordPopup` 添加保存按钮
2. 创建 `VocabularyCard` 组件
3. 创建 `app/vocabulary/page.tsx`

**Step 3: 集成测试**（15 分钟）
1. 测试保存流程
2. 测试列表展示
3. 测试删除功能

### 1.6 边界情况处理

- **重复保存**：检查单词是否已存在，提示"已保存"
- **存储限制**：localStorage 有 5-10MB 限制，超出时提示用户清理或升级到云端
- **数据迁移**：提供 localStorage → 云端的迁移工具
- **离线支持**：云端版本也要支持离线保存，后台同步

---

## 2. 用户认证系统

### 2.1 技术选型

**推荐方案：Supabase Auth**

**优点**：
- 开箱即用的认证系统
- 支持邮箱/密码、OAuth（Google、GitHub）
- 自动处理 JWT token
- 内置邮箱验证、密码重置
- 与 Supabase 数据库无缝集成

**缺点**：
- 供应商锁定
- 自定义能力有限

**替代方案**：
- NextAuth.js（更灵活，但需要自己配置）
- Clerk（更现代，但付费）

### 2.2 认证流程

#### 注册流程

```
用户输入邮箱 + 密码
    ↓
前端验证（邮箱格式、密码强度）
    ↓
调用 Supabase signUp API
    ↓
Supabase 发送验证邮件
    ↓
用户点击邮件链接验证
    ↓
重定向到登录页面
```

#### 登录流程

```
用户输入邮箱 + 密码
    ↓
调用 Supabase signIn API
    ↓
获取 JWT token
    ↓
存储到 cookie（httpOnly）
    ↓
重定向到首页
```

#### OAuth 流程（Google）

```
用户点击"使用 Google 登录"
    ↓
重定向到 Google OAuth 页面
    ↓
用户授权
    ↓
Google 回调到 /auth/callback
    ↓
Supabase 创建/更新用户
    ↓
重定向到首页
```

### 2.3 数据迁移策略

**从 localStorage 迁移到云端**

```typescript
// lib/migration.ts
async function migrateLocalDataToCloud(userId: string) {
  // 1. 读取 localStorage 数据
  const localVocabulary = getLocalVocabulary();
  const localHistory = getLocalHistory();
  const localStats = getLocalStats();
  
  // 2. 批量上传到云端
  await Promise.all([
    uploadVocabulary(userId, localVocabulary),
    uploadHistory(userId, localHistory),
    uploadStats(userId, localStats)
  ]);
  
  // 3. 验证上传成功
  const cloudData = await fetchCloudData(userId);
  if (cloudData.vocabulary.length === localVocabulary.length) {
    // 4. 清理本地数据（可选，保留作为备份）
    // clearLocalData();
    
    // 5. 标记迁移完成
    localStorage.setItem('migration_completed', 'true');
  }
}
```

### 2.4 会话管理

```typescript
// lib/auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 获取当前用户
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// 登出
export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/login';
}

// 刷新 token
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return data.session;
}
```

---

## 3. 学习统计系统

### 3.1 数据收集

#### 学习时长追踪

```typescript
// lib/analytics.ts
class StudyTimeTracker {
  private startTime: number | null = null;
  private totalTime: number = 0;
  private isActive: boolean = false;
  
  start() {
    if (!this.isActive) {
      this.startTime = Date.now();
      this.isActive = true;
    }
  }
  
  pause() {
    if (this.isActive && this.startTime) {
      this.totalTime += Date.now() - this.startTime;
      this.isActive = false;
      this.startTime = null;
    }
  }
  
  getTotalTime() {
    let total = this.totalTime;
    if (this.isActive && this.startTime) {
      total += Date.now() - this.startTime;
    }
    return Math.floor(total / 1000); // 返回秒数
  }
  
  async save() {
    const duration = this.getTotalTime();
    await saveDailyStats({
      date: new Date().toISOString().split('T')[0],
      studyDuration: duration
    });
  }
}

// 使用
const tracker = new StudyTimeTracker();

// 视频播放时开始计时
player.on('play', () => tracker.start());

// 视频暂停时停止计时
player.on('pause', () => tracker.pause());

// 页面卸载时保存
window.addEventListener('beforeunload', () => tracker.save());
```

#### 学习事件追踪

```typescript
interface LearningEvent {
  type: 'word_saved' | 'video_watched' | 'review_completed';
  timestamp: number;
  metadata: Record<string, any>;
}

// 保存单词时
trackEvent({
  type: 'word_saved',
  timestamp: Date.now(),
  metadata: { word, videoId }
});

// 完成视频时
trackEvent({
  type: 'video_watched',
  timestamp: Date.now(),
  metadata: { videoId, duration, completionRate }
});
```

### 3.2 统计指标

```typescript
interface DailyStats {
  date: string;              // YYYY-MM-DD
  studyDuration: number;     // 秒
  wordsSaved: number;
  videosWatched: number;
  reviewsCompleted: number;
}

interface OverallStats {
  totalStudyTime: number;    // 总学习时长（秒）
  totalWords: number;        // 总单词数
  totalVideos: number;       // 总视频数
  currentStreak: number;     // 当前连续天数
  longestStreak: number;     // 最长连续天数
  averageDailyTime: number;  // 平均每日学习时长
}
```

### 3.3 UI 设计

```tsx
// app/stats/page.tsx
export default function StatsPage() {
  return (
    <div className="container mx-auto p-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Clock />}
          title="总学习时长"
          value={formatDuration(stats.totalStudyTime)}
          trend="+12% vs 上周"
        />
        <StatCard
          icon={<BookOpen />}
          title="保存单词"
          value={stats.totalWords}
          trend="+23 本周"
        />
        <StatCard
          icon={<Video />}
          title="观看视频"
          value={stats.totalVideos}
          trend="+5 本周"
        />
        <StatCard
          icon={<Flame />}
          title="连续学习"
          value={`${stats.currentStreak} 天`}
          trend={`最长 ${stats.longestStreak} 天`}
        />
      </div>
      
      {/* 学习时长趋势图 */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">学习时长趋势</h2>
        <LineChart data={dailyStats} />
      </div>
      
      {/* 日历热力图 */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">学习日历</h2>
        <HeatmapCalendar data={dailyStats} />
      </div>
    </div>
  );
}
```

---

## 4. 间隔重复系统（SRS）

### 4.1 SM-2 算法实现

```typescript
// lib/srs.ts
interface ReviewResult {
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0=完全忘记, 5=完美记忆
}

interface CardState {
  easeFactor: number;    // 难度因子（初始 2.5）
  interval: number;      // 复习间隔（天）
  repetitions: number;   // 连续正确次数
  nextReview: Date;      // 下次复习日期
}

function calculateNextReview(
  currentState: CardState,
  result: ReviewResult
): CardState {
  const { quality } = result;
  let { easeFactor, interval, repetitions } = currentState;
  
  // 更新难度因子
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  // 更新间隔
  if (quality < 3) {
    // 回答错误，重置
    repetitions = 0;
    interval = 1;
  } else {
    // 回答正确
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }
  
  // 计算下次复习日期
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  
  return {
    easeFactor,
    interval,
    repetitions,
    nextReview
  };
}
```

### 4.2 复习队列管理

```typescript
// 获取今日待复习单词
async function getTodayReviewQueue(userId: string): Promise<VocabularyItem[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return await db.vocabulary
    .where('user_id', userId)
    .where('next_review', '<=', today)
    .orderBy('next_review', 'asc')
    .limit(50) // 每天最多 50 个
    .get();
}

// 获取新单词（从未复习过）
async function getNewWords(userId: string, limit: number = 10): Promise<VocabularyItem[]> {
  return await db.vocabulary
    .where('user_id', userId)
    .where('review_count', 0)
    .orderBy('saved_at', 'desc')
    .limit(limit)
    .get();
}
```

---

## 5. 导出功能

### 5.1 导出到 CSV

```typescript
// lib/export.ts
function exportToCSV(vocabulary: VocabularyItem[]): string {
  const headers = ['单词', '翻译', '上下文', '视频标题', '保存日期'];
  const rows = vocabulary.map(item => [
    item.word,
    item.translation,
    item.context,
    item.videoTitle,
    new Date(item.savedAt).toLocaleDateString()
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csv;
}

// 触发下载
function downloadCSV(vocabulary: VocabularyItem[]) {
  const csv = exportToCSV(vocabulary);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vocabulary_${Date.now()}.csv`;
  link.click();
}
```

### 5.2 导出到 Anki

```typescript
// Anki 卡片格式
interface AnkiCard {
  front: string;  // 正面（单词）
  back: string;   // 背面（翻译 + 上下文）
  tags: string[]; // 标签
}

function exportToAnki(vocabulary: VocabularyItem[]): string {
  const cards = vocabulary.map(item => ({
    front: item.word,
    back: `${item.translation}<br><br><i>${item.context}</i>`,
    tags: ['language-reactor', item.videoId]
  }));
  
  // 生成 Anki 可导入的文本格式
  return cards.map(card => 
    `${card.front}\t${card.back}\t${card.tags.join(' ')}`
  ).join('\n');
}
```

---

## 6. 性能优化

### 6.1 字幕预加载

```typescript
// 预加载下一个视频的字幕
async function preloadNextVideoSubtitles(currentVideoId: string) {
  const nextVideo = await getNextVideo(currentVideoId);
  if (nextVideo) {
    // 后台加载字幕
    fetchYouTubeSubtitles(nextVideo.id).then(subs => {
      cacheSubtitles(nextVideo.id, subs);
    });
  }
}
```

### 6.2 虚拟滚动

```tsx
// 词汇列表使用虚拟滚动（react-window）
import { FixedSizeList } from 'react-window';

function VocabularyList({ items }: { items: VocabularyItem[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={200}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <VocabularyCard item={items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### 6.3 图片懒加载

```tsx
// 视频缩略图懒加载
<img
  src={video.thumbnail}
  loading="lazy"
  alt={video.title}
/>
```

---

## 7. 测试策略

### 7.1 单元测试

```typescript
// __tests__/vocabulary.test.ts
describe('Vocabulary Management', () => {
  test('should save word to localStorage', () => {
    const word = {
      word: 'test',
      translation: '测试',
      context: 'This is a test.',
      videoId: 'abc123',
      timestamp: 10
    };
    
    saveWord(word);
    const saved = getVocabulary();
    
    expect(saved).toHaveLength(1);
    expect(saved[0].word).toBe('test');
  });
  
  test('should not save duplicate words', () => {
    const word = { word: 'test', ... };
    
    saveWord(word);
    saveWord(word);
    
    expect(getVocabulary()).toHaveLength(1);
  });
});
```

### 7.2 E2E 测试

```typescript
// e2e/vocabulary.spec.ts
import { test, expect } from '@playwright/test';

test('complete vocabulary workflow', async ({ page }) => {
  // 1. 打开视频页面
  await page.goto('/app?v=dQw4w9WgXcQ');
  
  // 2. 点击单词
  await page.click('text=serendipity');
  
  // 3. 保存单词
  await page.click('button:has-text("保存单词")');
  
  // 4. 验证提示
  await expect(page.locator('text=保存成功')).toBeVisible();
  
  // 5. 进入词汇表页面
  await page.goto('/vocabulary');
  
  // 6. 验证单词出现
  await expect(page.locator('text=serendipity')).toBeVisible();
});
```

---

**文档维护**：
- 每次实现新功能后，更新对应章节
- 记录技术决策的原因
- 保持代码示例与实际代码同步
