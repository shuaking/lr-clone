import { useEffect } from 'react';

export interface UseKeyboardShortcutsOptions {
  onPlayPause: () => void;
  onPrevSubtitle: () => void;
  onNextSubtitle: () => void;
  onClosePopup: () => void;
  enabled?: boolean;
}

const DEBUG = process.env.NODE_ENV === 'development';
const log = DEBUG ? console.log.bind(console) : () => {};

export function useKeyboardShortcuts({
  onPlayPause,
  onPrevSubtitle,
  onNextSubtitle,
  onClosePopup,
  enabled = true
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的按键
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          log('[useKeyboardShortcuts] Space pressed - toggle play/pause');
          onPlayPause();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          log('[useKeyboardShortcuts] ArrowLeft pressed - previous subtitle');
          onPrevSubtitle();
          break;

        case 'ArrowRight':
          e.preventDefault();
          log('[useKeyboardShortcuts] ArrowRight pressed - next subtitle');
          onNextSubtitle();
          break;

        case 'Escape':
          log('[useKeyboardShortcuts] Escape pressed - close popup');
          onClosePopup();
          break;

        default:
          // 不处理其他按键
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onPlayPause, onPrevSubtitle, onNextSubtitle, onClosePopup]);
}
