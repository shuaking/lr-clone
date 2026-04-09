/**
 * YouTube API 集成
 * 用于获取视频信息、搜索视频
 */

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: string;
  channel: string;
  channelId: string;
  publishedAt: string;
}

export interface YouTubeCaption {
  language: string;
  text: string;
  start: number;
  duration: number;
}

/**
 * 获取视频详情
 */
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const video = data.items[0];

    return {
      id: videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
      duration: formatDuration(video.contentDetails.duration),
      views: formatViews(video.statistics.viewCount),
      channel: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      publishedAt: video.snippet.publishedAt
    };
  } catch (error) {
    console.error('Failed to fetch video details:', error);
    return null;
  }
}

/**
 * 搜索视频
 */
export async function searchVideos(
  query: string,
  maxResults: number = 20
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}&relevanceLanguage=en`
    );

    const data = await response.json();

    if (!data.items) {
      return [];
    }

    // 获取每个视频的详细信息
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    const detailsData = await detailsResponse.json();

    return detailsData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      duration: formatDuration(video.contentDetails.duration),
      views: formatViews(video.statistics.viewCount),
      channel: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      publishedAt: video.snippet.publishedAt
    }));
  } catch (error) {
    console.error('Failed to search videos:', error);
    return [];
  }
}

/**
 * 从 URL 提取视频 ID
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // 如果已经是 ID 格式
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * 格式化时长（ISO 8601 -> MM:SS）
 */
function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return '0:00';

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 格式化观看次数
 */
function formatViews(views: string): string {
  const num = parseInt(views);

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }

  return num.toString();
}

/**
 * 获取视频嵌入 URL
 */
export function getEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * 获取视频缩略图 URL
 */
export function getThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  const qualityMap = {
    'default': 'default',
    'medium': 'mqdefault',
    'high': 'hqdefault',
    'maxres': 'maxresdefault'
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}
