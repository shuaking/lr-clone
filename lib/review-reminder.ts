/**
 * 复习提醒系统
 *
 * 浏览器通知 + 首页提醒
 */

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('浏览器不支持通知');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * 发送复习提醒通知
 */
export function sendReviewNotification(dueCount: number): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification('Language Reactor - 复习提醒', {
    body: `你有 ${dueCount} 个单词需要复习`,
    icon: '/icon-192.png', // 需要添加图标
    badge: '/badge-72.png',
    tag: 'review-reminder',
    requireInteraction: false,
    silent: false,
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = '/review';
    notification.close();
  };

  // 5 秒后自动关闭
  setTimeout(() => notification.close(), 5000);
}

/**
 * 检查是否需要发送提醒
 */
export function shouldSendReminder(lastReminderTime: number | null): boolean {
  if (!lastReminderTime) return true;

  const now = Date.now();
  const hoursSinceLastReminder = (now - lastReminderTime) / (1000 * 60 * 60);

  // 至少间隔 4 小时
  return hoursSinceLastReminder >= 4;
}

/**
 * 保存最后提醒时间
 */
export function saveLastReminderTime(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('last-review-reminder', Date.now().toString());
}

/**
 * 获取最后提醒时间
 */
export function getLastReminderTime(): number | null {
  if (typeof window === 'undefined') return null;

  const saved = localStorage.getItem('last-review-reminder');
  return saved ? parseInt(saved, 10) : null;
}

/**
 * 检查并发送复习提醒
 */
export async function checkAndSendReminder(dueCount: number): Promise<void> {
  if (dueCount === 0) return;

  const lastReminderTime = getLastReminderTime();

  if (!shouldSendReminder(lastReminderTime)) {
    return;
  }

  const hasPermission = await requestNotificationPermission();

  if (hasPermission) {
    sendReviewNotification(dueCount);
    saveLastReminderTime();
  }
}

/**
 * 设置定时提醒（每天固定时间）
 */
export function scheduleDailyReminder(hour: number, minute: number, callback: () => void): () => void {
  const checkTime = () => {
    const now = new Date();
    if (now.getHours() === hour && now.getMinutes() === minute) {
      callback();
    }
  };

  // 每分钟检查一次
  const intervalId = setInterval(checkTime, 60000);

  // 返回清理函数
  return () => clearInterval(intervalId);
}

/**
 * 获取用户偏好的提醒时间
 */
export interface ReminderPreferences {
  enabled: boolean;
  hour: number;
  minute: number;
}

export function getReminderPreferences(): ReminderPreferences {
  if (typeof window === 'undefined') {
    return { enabled: true, hour: 20, minute: 0 }; // 默认晚上 8 点
  }

  try {
    const saved = localStorage.getItem('reminder-preferences');
    return saved ? JSON.parse(saved) : { enabled: true, hour: 20, minute: 0 };
  } catch {
    return { enabled: true, hour: 20, minute: 0 };
  }
}

/**
 * 保存提醒偏好
 */
export function saveReminderPreferences(prefs: ReminderPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('reminder-preferences', JSON.stringify(prefs));
}
