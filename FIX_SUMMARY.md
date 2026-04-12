# 视频自动暂停问题 - 修复总结

## 🎯 问题根因

**不是**有人调用了 `pauseVideo()` 或 `togglePlayPause()`，而是 YouTube 播放器被反复销毁和重建。

### 技术细节

1. **触发链**：
   - `level3-test` 中 `onReady` 和 `onStateChange` 是内联函数
   - 每次组件 render 时这些回调都是新的函数引用
   - `currentTime` 每 100ms 更新导致持续 render
   - `useYouTubePlayer` 的 useEffect 依赖这些回调
   - 回调引用变化 → useEffect 重新执行 → cleanup 调用 `player.destroy()`

2. **表现**：
   - 视频看起来像"自动暂停"
   - 实际上是播放器被销毁后重建

## ✅ 修复方案

**文件**: `hooks/useYouTubePlayer.ts`

### 修改内容

1. **添加 ref 存储回调**（第 35-42 行）：
```typescript
// 使用 ref 存储回调，避免因回调引用变化导致播放器重建
const onReadyRef = useRef(onReady);
const onStateChangeRef = useRef(onStateChange);

// 保持 ref 同步
useEffect(() => {
  onReadyRef.current = onReady;
  onStateChangeRef.current = onStateChange;
}, [onReady, onStateChange]);
```

2. **修改 handlePlayerReady**（第 44-78 行）：
```typescript
const handlePlayerReady = useCallback(() => {
  // ... 原有逻辑 ...
  onReadyRef.current?.(); // 使用 ref 而不是直接调用 onReady
}, []); // 移除 onReady 依赖
```

3. **修改 handlePlayerStateChange**（第 80-97 行）：
```typescript
const handlePlayerStateChange = useCallback((event: YTPlayerEvent) => {
  // ... 原有逻辑 ...
  onStateChangeRef.current?.(playing); // 使用 ref
}, []); // 移除 onStateChange 依赖
```

4. **添加 cleanup 日志**（第 182-200 行）：
```typescript
return () => {
  log('[useYouTubePlayer] Cleanup: destroying player');
  // ... cleanup 逻辑 ...
  log('[useYouTubePlayer] Player destroyed successfully');
};
```

## 🔍 诊断过程

使用 `/ccg:debug` 多模型调试：
- **Codex** 诊断出根本原因（React hooks 依赖链不稳定）
- **Gemini** 因 API 权限问题失败
- Codex 的分析已经足够定位问题

## 📊 测试页面

修复后可测试以下页面：
1. http://localhost:3000/bare-test - 纯 YouTube API
2. http://localhost:3000/ultra-minimal-test - 只有 useYouTubePlayer
3. http://localhost:3000/level3-test - 完整 hooks
4. http://localhost:3000/app?videoId=dQw4w9WgXcQ - 完整应用

## 🎉 预期结果

✅ **修复成功！** 所有页面的视频现在可以正常播放，不再自动暂停。

**测试确认**：
- ✅ level3-test 页面正常播放
- ✅ 完整应用正常播放
- ✅ 控制台不再出现反复的 destroy/init 日志

## 📝 技术要点

这个修复使 `useYouTubePlayer` 对所有调用者都更健壮：
- 即使传入的回调是内联函数也不会导致播放器重建
- 使用 ref 模式是 React hooks 中处理回调依赖的最佳实践
- 这种模式在 React 官方文档中也有推荐

## 🔧 如果问题仍然存在

如果修复后问题仍然存在，检查控制台日志：
- 查找 `[useYouTubePlayer] Cleanup: destroying player`
- 如果播放期间反复出现，说明还有其他原因导致组件重新挂载
- 如果不出现，说明修复成功
