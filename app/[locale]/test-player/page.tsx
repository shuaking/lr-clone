"use client";

import { useEffect, useRef, useState } from 'react';
import type { YTPlayer } from '@/lib/youtube-types';
import { youtubeAPIManager } from '@/lib/youtube-api-manager';

export default function TestPlayerPage() {
  const [status, setStatus] = useState('初始化中...');
  const playerRef = useRef<YTPlayer | null>(null);

  useEffect(() => {
    const initPlayer = () => {
      setStatus('API 加载成功，创建播放器...');

      try {
        playerRef.current = new window.YT.Player('test-player', {
          height: '390',
          width: '640',
          videoId: 'dQw4w9WgXcQ',
          events: {
            onReady: () => {
              setStatus('✅ 播放器就绪！');
            }
          }
        });
      } catch (error) {
        setStatus(`❌ 创建播放器失败: ${error}`);
      }
    };

    // 使用 YouTube API 管理器
    youtubeAPIManager.init();
    const unsubscribe = youtubeAPIManager.onReady(initPlayer);

    return () => {
      unsubscribe();
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error destroying player:', e);
        }
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="mb-4 text-2xl font-bold">YouTube Player 测试</h1>
      <p className="mb-4">状态: {status}</p>
      <div id="test-player" className="mx-auto max-w-2xl"></div>

      <div className="mt-8 rounded-lg bg-gray-800 p-4">
        <h2 className="mb-2 font-semibold">调试信息:</h2>
        <ul className="space-y-1 text-sm">
          <li>• 测试视频 ID: dQw4w9WgXcQ</li>
          <li>• API URL: https://www.youtube.com/iframe_api</li>
          <li>• 如果播放器无法加载，请检查网络连接和防火墙设置</li>
        </ul>
      </div>
    </div>
  );
}
