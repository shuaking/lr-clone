/**
 * 模拟字幕数据
 * 用于在无法获取真实字幕时提供示例内容
 */

export interface MockSubtitle {
  id: string;
  start: number;
  end: number;
  text: string;
  translation: string;
}

/**
 * Rick Astley - Never Gonna Give You Up 字幕
 */
const rickAstleySubtitles: MockSubtitle[] = [
  {
    id: "1",
    start: 43,
    end: 47,
    text: "We're no strangers to love",
    translation: "我们对爱并不陌生"
  },
  {
    id: "2",
    start: 47,
    end: 50,
    text: "You know the rules and so do I",
    translation: "你知道规则，我也知道"
  },
  {
    id: "3",
    start: 50,
    end: 54,
    text: "A full commitment's what I'm thinking of",
    translation: "我想要的是全心全意的承诺"
  },
  {
    id: "4",
    start: 54,
    end: 58,
    text: "You wouldn't get this from any other guy",
    translation: "你不会从其他人那里得到这些"
  },
  {
    id: "5",
    start: 58,
    end: 62,
    text: "I just wanna tell you how I'm feeling",
    translation: "我只想告诉你我的感受"
  },
  {
    id: "6",
    start: 62,
    end: 65,
    text: "Gotta make you understand",
    translation: "要让你明白"
  },
  {
    id: "7",
    start: 65,
    end: 68,
    text: "Never gonna give you up",
    translation: "永远不会放弃你"
  },
  {
    id: "8",
    start: 68,
    end: 71,
    text: "Never gonna let you down",
    translation: "永远不会让你失望"
  }
];

/**
 * 默认英语学习对话字幕
 */
const defaultSubtitles: MockSubtitle[] = [
  {
    id: "1",
    start: 0,
    end: 3,
    text: "Every year, millions of people set a language learning goal.",
    translation: "每年，数百万人设定语言学习目标。"
  },
  {
    id: "2",
    start: 3,
    end: 6,
    text: "They make a plan. They sign up for a course, download an app, hire a tutor.",
    translation: "他们制定计划。他们报名参加课程，下载APP，聘请导师。"
  },
  {
    id: "3",
    start: 6,
    end: 9,
    text: "They start with real motivation and real effort.",
    translation: "他们以真正的动力和真正的努力开始。"
  },
  {
    id: "4",
    start: 9,
    end: 12,
    text: "And then life gets busy. Deadline, a difficult week, a family disruption.",
    translation: "然后生活变得忙碌。截止日期，艰难的一周，家庭混乱。"
  },
  {
    id: "5",
    start: 12,
    end: 15,
    text: "And everything collapses. When that happens, most people give up.",
    translation: "一切都崩溃了。当这种情况发生时，大多数人都会放弃。"
  },
  {
    id: "6",
    start: 15,
    end: 18,
    text: "But what if there was a different way? What if you could learn naturally?",
    translation: "但如果有不同的方法呢？如果你可以自然地学习呢？"
  },
  {
    id: "7",
    start: 18,
    end: 21,
    text: "By watching content you actually enjoy, in the language you want to learn.",
    translation: "通过观看你真正喜欢的内容，用你想学习的语言。"
  },
  {
    id: "8",
    start: 21,
    end: 24,
    text: "That's the idea behind Language Reactor. Learn through entertainment.",
    translation: "这就是 Language Reactor 背后的理念。通过娱乐学习。"
  }
];

/**
 * 根据视频 ID 获取对应的模拟字幕
 */
export function getMockSubtitles(videoId: string): MockSubtitle[] {
  switch (videoId) {
    case 'dQw4w9WgXcQ': // Rick Astley - Never Gonna Give You Up
      return rickAstleySubtitles;
    default:
      return defaultSubtitles;
  }
}
