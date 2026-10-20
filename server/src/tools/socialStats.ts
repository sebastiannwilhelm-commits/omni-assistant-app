import { FunctionDeclaration, Type } from '@google/genai';

export interface SocialPostMetrics {
  platform: string;
  metricFocus: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRatePercent: number;
  watchTimeHours: number;
  followerChangeThisPeriod: string;
  topPostTitle: string;
}

export const getSocialPostMetricsDeclaration: FunctionDeclaration = {
  name: 'get_social_post_metrics',
  description:
    'Retrieves the user\'s social media post and channel metrics (views, likes, comments, shares, engagement rate, watch hours, and top post title) for platforms such as TikTok, YouTube, X (Twitter), Twitch, or Instagram.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      platform: {
        type: Type.STRING,
        description:
          'Social media platform to query (e.g., "TikTok", "YouTube", "X", "Twitch", "Instagram").',
      },
      metric_focus: {
        type: Type.STRING,
        description:
          'Optional focus of the query such as "latest_post", "top_performing", or "channel_overview". Defaults to "top_performing".',
      },
    },
    required: ['platform'],
  },
};

const MOCK_SOCIAL_DATABASE: Record<string, Omit<SocialPostMetrics, 'metricFocus'>> = {
  tiktok: {
    platform: 'TikTok',
    views: 84200,
    likes: 9640,
    comments: 412,
    shares: 1285,
    engagementRatePercent: 13.46,
    watchTimeHours: 318.5,
    followerChangeThisPeriod: '+1,420 followers this week',
    topPostTitle: '1v3 Clutch in Final Ring (Apex Ranked)',
  },
  youtube: {
    platform: 'YouTube',
    views: 31500,
    likes: 2890,
    comments: 347,
    shares: 410,
    engagementRatePercent: 11.58,
    watchTimeHours: 2460.0,
    followerChangeThisPeriod: '+680 subscribers this month',
    topPostTitle: 'My Complete Warzone Season Loadout Breakdown & Recoil Guide',
  },
  x: {
    platform: 'X (Twitter)',
    views: 19400,
    likes: 1120,
    comments: 148,
    shares: 215,
    engagementRatePercent: 7.64,
    watchTimeHours: 42.0,
    followerChangeThisPeriod: '+230 followers this week',
    topPostTitle: 'Hit Ascendant II solo-queue! Here are my sensitivity settings:',
  },
  twitch: {
    platform: 'Twitch',
    views: 6840,
    likes: 920,
    comments: 4820,
    shares: 145,
    engagementRatePercent: 18.2,
    watchTimeHours: 1890.4,
    followerChangeThisPeriod: '+195 followers & 34 new subs this month',
    topPostTitle: 'Late Night Ranked Grind w/ Viewers',
  },
};

export function getSocialPostMetrics(args: {
  platform?: string;
  metric_focus?: string;
}): SocialPostMetrics {
  const rawPlatform = (args.platform || 'TikTok').trim();
  const metricFocus = (args.metric_focus || 'top_performing').trim();
  const normalized = rawPlatform.toLowerCase();

  if (normalized.includes('tiktok') || normalized.includes('tik tok')) {
    return { ...MOCK_SOCIAL_DATABASE.tiktok, metricFocus };
  }
  if (normalized.includes('youtube') || normalized.includes('yt')) {
    return { ...MOCK_SOCIAL_DATABASE.youtube, metricFocus };
  }
  if (normalized === 'x' || normalized.includes('twitter')) {
    return { ...MOCK_SOCIAL_DATABASE.x, metricFocus };
  }
  if (normalized.includes('twitch')) {
    return { ...MOCK_SOCIAL_DATABASE.twitch, metricFocus };
  }

  return {
    platform: rawPlatform,
    metricFocus,
    views: 14200,
    likes: 1380,
    comments: 164,
    shares: 205,
    engagementRatePercent: 12.31,
    watchTimeHours: 140.2,
    followerChangeThisPeriod: '+310 followers this period',
    topPostTitle: 'Weekly Highlights Reel #14',
  };
}
