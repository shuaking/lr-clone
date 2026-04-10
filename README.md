# Language Reactor Clone

一个功能完整的语言学习 Web 应用，实现了 Language Reactor 的核心功能。

## ✨ 功能特性

### 核心功能
- 📖 **智能文本阅读器** - 双语对照，点击单词即时翻译
- 📚 **词汇管理系统** - 保存、管理、导出学习词汇
- 🎧 **PhrasePump 听力练习** - 基于已保存词汇的填空练习
- 🎬 **内容目录** - 精选 YouTube 学习资源
- 🎥 **视频播放器** - 嵌入式播放，一键收藏
- ❤️ **视频收藏** - 管理喜欢的学习视频
- 🔍 **视频搜索** - YouTube API 集成（可选）
- 💾 **Anki 导出** - 一键导出为 Anki 卡片格式
- 📊 **学习统计** - 追踪学习进度和成就系统
- 🏆 **成就徽章** - 13 个成就，7 个等级
- 🔥 **连续学习** - Streak 追踪，保持学习动力

### 技术特性
- 🌍 **多语言支持** - 中文、英文、日文界面（基于 next-intl）
- 🔐 **本地认证系统** - 无需配置数据库即可使用（支持 Supabase 可选集成）
- 📱 **PWA 支持** - 可安装为桌面/移动应用
- 🎨 **现代化 UI** - 深色主题，响应式设计，WCAG AA 无障碍标准
- ⚡ **性能优化** - 图片懒加载，虚拟滚动，字幕预加载

## 🚀 快速开始

### 基础安装

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 认证配置

项目支持两种认证模式：

#### 1. 本地模式（默认，无需配置）
- 用户数据存储在浏览器 localStorage
- 适合开发和个人使用
- 无需任何配置即可注册/登录

#### 2. Supabase 模式（可选）
如需云端数据同步，创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

详细使用指南请查看 [USAGE.md](./USAGE.md)

## 🛠️ 技术栈

- **框架**: Next.js 15.0.7 (App Router) + React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **国际化**: next-intl
- **状态管理**: Zustand
- **认证**: Supabase (可选) + 本地 fallback
- **翻译 API**: MyMemory Translation API
- **视频 API**: YouTube Data API v3 (可选)

## 📖 使用说明

1. **文本阅读**: 访问 `/app`，导入文本开始学习
2. **保存单词**: 点击任意单词查看翻译并保存
3. **听力练习**: 访问 `/phrasepump` 进行听力训练
4. **浏览内容**: 访问 `/catalog` 查看学习资源
5. **查看统计**: 访问 `/stats` 追踪学习进度和成就

详细使用指南请查看 [USAGE.md](./USAGE.md)  
学习统计说明请查看 [STATS_GUIDE.md](./STATS_GUIDE.md)

## 📝 注意

本项目仅供个人学习使用。
