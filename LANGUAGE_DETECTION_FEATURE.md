# 自动语言检测功能 - 实现文档

> **实现日期**: 2026-04-10  
> **版本**: 1.0.0  
> **状态**: ✅ 已完成并通过测试

---

## 📋 功能概述

自动语言检测系统能够识别视频和频道的语言,并根据检测结果智能推荐最佳的学习语言对。该功能大幅提升了用户体验,让用户无需手动判断内容语言。

## ✨ 核心功能

### 1. 多语言检测引擎
- **支持语言**: 8 种语言
  - English (英语)
  - 中文 (中文)
  - 日本語 (日语)
  - 한국어 (韩语)
  - ไทย (泰语)
  - Español (西班牙语)
  - Français (法语)
  - Deutsch (德语)

### 2. 检测算法
- **字符范围匹配**: 使用 Unicode 范围识别特定语言字符
  - 中文: 0x4e00-0x9fff, 0x3400-0x4dbf
  - 日文: 0x3040-0x309f (平假名), 0x30a0-0x30ff (片假名)
  - 韩文: 0xac00-0xd7af, 0x1100-0x11ff
  - 泰文: 0x0E00-0x0E7F
  
- **正则模式匹配**: 识别语言特征词汇和字符
  - 西班牙语: áéíóúñü, el/la/los/las 等
  - 法语: àâäæçéèêëïîôùûüÿœ, le/la/les 等
  - 德语: äöüß, der/die/das 等
  - 英语: 纯英文字符 + 常用词汇

- **评分系统**:
  - 字符范围匹配: +2 分
  - 正则模式匹配: +1 分
  - 最低阈值: 3 分 (低于此分数返回 'unknown')

### 3. 视频语言检测
- 综合分析视频标题和频道名称
- 优先使用标题语言
- 标题和频道语言一致时提高置信度
- 自动过滤 'unknown' 结果

### 4. 智能语言对推荐
- 分析当前筛选结果中的主要语言
- 当超过 50% 的视频是非当前源语言时触发建议
- 显示建议横幅,包含:
  - 检测到的主要语言及占比
  - 建议的语言对组合
  - 一键切换按钮
  - 保持当前设置选项
  - 关闭按钮

### 5. 视觉标识
- **视频卡片**: 左上角显示 Globe 图标 + 语言名称
- **频道卡片**: 标签区域显示语言标识
- **建议横幅**: 使用 Lightbulb 图标突出显示
- **颜色方案**: 使用品牌色 (brand) 高亮显示

## 🏗️ 技术实现

### 文件结构

```
lib/
├── language-detection.ts          # 核心检测引擎
├── language-pairs.ts              # 语言对配置
└── stores/
    └── language-pair-store.ts     # 语言对状态管理

components/
├── content-catalog.tsx            # 内容目录 (集成检测)
└── channel-browser.tsx            # 频道浏览器 (集成检测)
```

### 核心 API

#### `detectLanguage(text: string): DetectedLanguage`
检测单个文本的语言。

**参数**:
- `text`: 要检测的文本

**返回**: 检测到的语言代码或 'unknown'

**示例**:
```typescript
detectLanguage("Hello World")  // 'en'
detectLanguage("你好世界")      // 'zh-CN'
detectLanguage("こんにちは")    // 'ja'
```

#### `detectVideoLanguage(title: string, channel?: string): DetectedLanguage`
检测视频语言 (综合标题和频道)。

**参数**:
- `title`: 视频标题
- `channel`: 频道名称 (可选)

**返回**: 检测到的语言代码

**示例**:
```typescript
detectVideoLanguage("Learn English", "English Academy")  // 'en'
detectVideoLanguage("日本語レッスン", "日本語チャンネル")  // 'ja'
```

#### `getLanguageName(code: DetectedLanguage): string`
获取语言的本地化名称。

**参数**:
- `code`: 语言代码

**返回**: 语言名称

**示例**:
```typescript
getLanguageName('en')     // 'English'
getLanguageName('zh-CN')  // '中文'
getLanguageName('ja')     // '日本語'
```

#### `suggestLanguagePair(detectedLang: DetectedLanguage, userTargetLang: string): string | null`
根据检测到的语言建议语言对。

**参数**:
- `detectedLang`: 检测到的语言
- `userTargetLang`: 用户的目标语言 (默认 'zh-CN')

**返回**: 语言对 ID 或 null

**示例**:
```typescript
suggestLanguagePair('en', 'zh-CN')  // 'en-zh'
suggestLanguagePair('ja', 'zh-CN')  // 'ja-zh'
```

#### `detectVideosLanguage(videos: Array<{title: string; channel?: string}>): Map<number, DetectedLanguage>`
批量检测多个视频的语言。

**参数**:
- `videos`: 视频数组

**返回**: Map<索引, 语言代码>

## 🎨 用户界面

### 视频卡片语言标识
- **位置**: 视频缩略图左上角
- **样式**: 黑色半透明背景 + 白色文字
- **内容**: Globe 图标 (12px) + 语言名称
- **显示条件**: 仅在成功检测到语言时显示

### 频道卡片语言标识
- **位置**: 频道信息标签区域
- **样式**: 品牌色背景 + 品牌色文字
- **内容**: Globe 图标 (12px) + 语言名称
- **显示条件**: 仅在成功检测到语言时显示

### 智能推荐横幅
- **位置**: 内容目录页面顶部 (搜索框下方)
- **样式**: 品牌色背景 + 边框
- **内容**:
  - Lightbulb 图标
  - 检测结果说明 (语言 + 占比)
  - 建议的语言对
  - 两个操作按钮
  - 关闭按钮
- **触发条件**: 主要语言占比 > 50% 且与当前设置不匹配
- **动画**: Framer Motion 淡入淡出效果

## 📊 性能优化

### 1. 缓存机制
- 使用 `useMemo` 缓存检测结果
- 仅在视频列表变化时重新检测
- 避免重复计算

### 2. 批量处理
- 支持批量检测多个视频
- 使用 Map 数据结构快速查找

### 3. 懒加载
- 检测结果按需计算
- 不影响页面初始加载速度

## 🧪 测试验证

### 构建测试
```bash
npm run build
# ✓ Compiled successfully
# ✓ Generating static pages (4/4)
```

### 功能测试
- ✅ 英文视频正确识别为 'en'
- ✅ 中文视频正确识别为 'zh-CN'
- ✅ 日文视频正确识别为 'ja'
- ✅ 韩文视频正确识别为 'ko'
- ✅ 泰文视频正确识别为 'th'
- ✅ 混合语言视频选择主要语言
- ✅ 语言标识正确显示在卡片上
- ✅ 智能推荐横幅正确触发
- ✅ 一键切换语言对功能正常

## 📝 使用示例

### 场景 1: 用户浏览英文内容
1. 用户当前语言对: 英语 → 中文
2. 系统检测到视频是英语
3. 视频卡片显示 "English" 标识
4. 无需显示建议横幅 (语言匹配)

### 场景 2: 用户浏览日文内容
1. 用户当前语言对: 英语 → 中文
2. 系统检测到 80% 的视频是日语
3. 显示建议横幅: "检测到 80% 的视频是日本語,建议切换到 日本語 → 中文"
4. 用户点击"切换语言对"
5. 系统自动切换到 日语 → 中文
6. 内容自动重新筛选

### 场景 3: 频道浏览
1. 用户访问频道浏览页面
2. 系统检测每个频道的语言
3. 频道卡片显示语言标识
4. 用户可以快速识别频道语言

## 🔄 未来扩展

### 短期 (1-2 周)
- [ ] 添加更多语言支持 (俄语、阿拉伯语、印地语等)
- [ ] 优化检测算法准确率
- [ ] 添加用户反馈机制 (报告错误检测)

### 中期 (1 个月)
- [ ] 机器学习模型集成 (提高准确率)
- [ ] 多语言混合内容处理
- [ ] 语言难度评估

### 长期 (3 个月+)
- [ ] 方言和口音识别
- [ ] 实时字幕语言检测
- [ ] 个性化语言推荐

## 📚 相关文档

- [README.md](./README.md) - 项目概述
- [USAGE.md](./USAGE.md) - 使用指南
- [ROADMAP.md](./ROADMAP.md) - 功能路线图
- [lib/language-detection.ts](./lib/language-detection.ts) - 源代码

## 🎯 总结

自动语言检测功能是 Language Reactor Clone 的重要增强,它通过智能识别内容语言并提供个性化推荐,显著提升了用户体验。该功能已完全集成到内容目录和频道浏览器中,并通过了完整的构建和功能测试。

**关键成果**:
- ✅ 支持 8 种语言检测
- ✅ 智能语言对推荐
- ✅ 视觉化语言标识
- ✅ 性能优化和缓存
- ✅ 完整的文档和测试

---

**维护者**: Claude Sonnet 4  
**最后更新**: 2026-04-10
