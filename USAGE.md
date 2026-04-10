# Language Reactor Clone - 使用指南

一个功能完整的语言学习应用，模仿 Language Reactor 的核心功能。

## 🎯 已实现的功能

### ✅ 核心功能
- **文本阅读器** - 导入文本，自动分句，双语对照显示
- **智能词典** - 点击任意单词查看翻译、发音、释义
- **词汇管理** - 保存学习的单词，查看学习历史
- **Anki 导出** - 将保存的单词导出为 CSV 格式，导入 Anki
- **PhrasePump** - 听力练习工具，基于已保存词汇生成填空练习
- **内容目录** - 浏览精选的 YouTube 学习内容（带筛选和搜索）

### 🎨 界面特性
- 深色主题设计
- 响应式布局（支持手机、平板、桌面）
- 流畅的动画和交互
- 现代化的 UI 组件

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

### 3. 注册账号
- 访问 `/login` 页面
- 点击"没有账号？立即注册"
- 填写邮箱和密码（至少 6 个字符）
- 注册成功后自动登录

**注意**: 默认使用本地存储模式，数据保存在浏览器 localStorage 中。

### 4. 配置云端同步（可选）

如果需要跨设备同步数据，可以配置 Supabase：

```bash
# 创建 .env.local 文件
cp .env.local.example .env.local
```

编辑 `.env.local`：
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

配置后重启开发服务器，系统将自动使用 Supabase 进行认证和数据存储。

## 📖 功能使用指南

### 文本阅读器
1. 访问 `/app` 页面
2. 点击 "Reader" 标签
3. 粘贴任何英文文本
4. 点击 "开始阅读"
5. 点击任意单词查看翻译
6. 点击书签图标保存单词

### 词汇管理
1. 在 `/app` 页面点击 "Saved words" 标签
2. 查看所有保存的单词
3. 点击垃圾桶图标删除单词
4. 点击 "导出 Anki" 下载 CSV 文件

### PhrasePump 听力练习
1. 访问 `/phrasepump` 页面
2. 确保已保存一些单词
3. 点击播放按钮听音频
4. 在空白处填入听到的单词
5. 提交答案查看结果

### 内容目录
1. 访问 `/catalog` 页面
2. 使用分类和难度筛选内容
3. 搜索感兴趣的视频
4. 点击视频卡片查看详情

## 🛠️ 技术栈

- **框架**: Next.js 15.0.7 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **国际化**: next-intl (支持中文、英文、日文)
- **状态管理**: Zustand
- **动画**: Framer Motion
- **图标**: Lucide React
- **认证**: 本地存储 + Supabase (可选)
- **翻译 API**: MyMemory Translation API (免费)
- **视频 API**: YouTube Data API v3 (可选)

## 📁 项目结构

```
lr-clone/
├── app/                    # Next.js 页面
│   ├── page.tsx           # 首页
│   ├── app/page.tsx       # 应用主界面
│   ├── catalog/page.tsx   # 内容目录
│   ├── phrasepump/page.tsx # PhrasePump
│   ├── pricing/page.tsx   # 定价页面
│   └── login/page.tsx     # 登录页面
├── components/            # React 组件
│   ├── text-reader.tsx    # 文本阅读器
│   ├── word-popup.tsx     # 词典弹窗
│   ├── interactive-text.tsx # 可交互文本
│   ├── saved-words-list.tsx # 词汇列表
│   ├── phrase-pump.tsx    # PhrasePump 组件
│   └── content-catalog.tsx # 内容目录
├── lib/                   # 工具函数
│   ├── dictionary-api.ts  # 词典 API
│   ├── storage.ts         # 本地存储
│   ├── text-processor.ts  # 文本处理
│   ├── content-data.ts    # 内容数据
│   └── supabase/          # Supabase 配置
└── public/                # 静态资源
```

## 🔧 自定义配置

### 修改主题颜色
编辑 `tailwind.config.ts`：
```typescript
colors: {
  brand: "#7c9cff",    // 主色调
  accent: "#78f0c8",   // 强调色
  // ...
}
```

### 更换翻译 API
编辑 `lib/dictionary-api.ts`，替换为其他翻译服务：
- Google Translate API
- DeepL API
- 有道词典 API

### 添加更多内容
编辑 `lib/content-data.ts`，添加更多视频数据。

## 🚧 待实现功能

以下功能可以在未来添加：

- [ ] 用户认证（Supabase Auth）
- [ ] 云端同步（保存到数据库）
- [ ] Chrome 扩展（Netflix/YouTube 字幕）
- [ ] AI Chatbot（需要 OpenAI API）
- [ ] 语音识别（Web Speech API）
- [ ] 学习统计和进度追踪
- [ ] 社区分享功能
- [ ] 移动端 App

## 📝 注意事项

### 数据存储
- **本地模式**: 数据保存在浏览器 localStorage，清除浏览器数据会丢失
- **Supabase 模式**: 数据保存在云端，支持跨设备同步

### API 限制
- **翻译 API**: MyMemory API 有每日请求限制，如需大量使用请注册 API key
- **YouTube API**: 视频搜索功能需要配置 YouTube Data API v3 密钥

### 浏览器兼容性
- 语音合成功能需要现代浏览器支持
- 推荐使用 Chrome、Edge、Firefox 最新版本
- PWA 功能需要 HTTPS 环境（开发环境除外）

### 内容版权
- 示例内容仅供学习使用
- 实际部署需要合法的内容来源

### 无障碍支持
- 符合 WCAG AA 标准
- 支持键盘导航
- 支持屏幕阅读器

## 🤝 贡献

这是一个学习项目，欢迎提出改进建议！

## 📄 许可

仅供个人学习使用。
