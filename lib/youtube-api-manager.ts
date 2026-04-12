/**
 * YouTube IFrame API 管理器
 * 解决多个组件同时初始化 YouTube API 时的竞争条件问题
 */

type ReadyCallback = () => void;

class YouTubeAPIManager {
  private callbacks: Set<ReadyCallback> = new Set();
  private isReady = false;
  private isLoading = false;

  /**
   * 初始化 YouTube API
   */
  init(): void {
    // 如果已经加载完成,直接返回
    if (window.YT?.Player) {
      this.isReady = true;
      return;
    }

    // 如果正在加载,不重复加载
    if (this.isLoading) {
      return;
    }

    // 检查脚本是否已存在
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) {
      this.isLoading = true;
      this.setupCallback();
      return;
    }

    // 加载脚本
    this.isLoading = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    this.setupCallback();
  }

  /**
   * 设置全局回调
   */
  private setupCallback(): void {
    // 保存旧的回调(如果存在)
    const oldCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      // 调用旧的回调
      if (oldCallback && typeof oldCallback === 'function') {
        try {
          oldCallback();
        } catch (error) {
          console.error('[YouTubeAPIManager] Error in old callback:', error);
        }
      }

      // 标记为就绪
      this.isReady = true;
      this.isLoading = false;

      // 执行所有注册的回调
      this.callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('[YouTubeAPIManager] Error in callback:', error);
        }
      });

      // 清空回调列表
      this.callbacks.clear();
    };
  }

  /**
   * 注册就绪回调
   * 如果 API 已就绪,立即执行回调
   * 否则,将回调加入队列
   */
  onReady(callback: ReadyCallback): () => void {
    if (this.isReady) {
      // 已就绪,立即执行
      try {
        callback();
      } catch (error) {
        console.error('[YouTubeAPIManager] Error in immediate callback:', error);
      }
    } else {
      // 未就绪,加入队列
      this.callbacks.add(callback);
    }

    // 返回取消注册函数
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * 检查 API 是否已就绪
   */
  isAPIReady(): boolean {
    return this.isReady;
  }
}

// 单例实例
export const youtubeAPIManager = new YouTubeAPIManager();
