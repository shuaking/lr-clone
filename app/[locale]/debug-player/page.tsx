"use client";

import { useEffect, useRef, useState } from 'react';
import { youtubeAPIManager } from '@/lib/youtube-api-manager';

export default function DebugPlayerPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [playerState, setPlayerState] = useState('未初始化');
  const playerRef = useRef<any>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    addLog('开始加载 YouTube API');

    const initPlayer = () => {
      addLog('YouTube API 加载完成');
      setPlayerState('API 就绪');

      try {
        playerRef.current = new (window as any).YT.Player('player', {
          height: '390',
          width: '640',
          videoId: 'dQw4w9WgXcQ',
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              addLog('✅ 播放器就绪');
              setPlayerState('播放器就绪');
            },
            onStateChange: (event: any) => {
              const states: any = {
                '-1': '未开始',
                '0': '已结束',
                '1': '正在播放',
                '2': '已暂停',
                '3': '缓冲中',
                '5': '已加载'
              };
              const stateName = states[event.data] || '未知';
              addLog(`状态变化: ${stateName} (${event.data})`);
              setPlayerState(stateName);
            }
          }
        });
      } catch (error) {
        addLog(`❌ 创建播放器失败: ${error}`);
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
          addLog(`清理播放器时出错: ${e}`);
        }
        playerRef.current = null;
      }
    };
  }, []);

  const handlePlay = () => {
    addLog('🎬 点击播放按钮');
    if (playerRef.current?.playVideo) {
      playerRef.current.playVideo();
      addLog('已调用 playVideo()');
    } else {
      addLog('❌ 播放器未就绪');
    }
  };

  const handlePause = () => {
    addLog('⏸️ 点击暂停按钮');
    if (playerRef.current?.pauseVideo) {
      playerRef.current.pauseVideo();
      addLog('已调用 pauseVideo()');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="mb-4 text-2xl font-bold">YouTube Player 调试页面</h1>

      <div className="mb-4 rounded-lg bg-gray-800 p-4">
        <p className="text-lg">当前状态: <span className="font-bold text-green-400">{playerState}</span></p>
      </div>

      <div className="mb-4">
        <div id="player"></div>
      </div>

      <div className="mb-4 flex gap-4">
        <button
          onClick={handlePlay}
          className="rounded-lg bg-green-600 px-6 py-3 font-bold hover:bg-green-700"
        >
          ▶️ 播放
        </button>
        <button
          onClick={handlePause}
          className="rounded-lg bg-red-600 px-6 py-3 font-bold hover:bg-red-700"
        >
          ⏸️ 暂停
        </button>
      </div>

      <div className="rounded-lg bg-gray-800 p-4">
        <h2 className="mb-2 font-bold">日志记录:</h2>
        <div className="max-h-96 overflow-y-auto font-mono text-sm">
          {logs.map((log, i) => (
            <div key={i} className="border-b border-gray-700 py-1">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
