import { FunctionDeclaration, Type } from '@google/genai';
import { env, hasConfiguredTikTokToken } from '../config/env';

const TIKTOK_USER_INFO_ENDPOINT = 'https://open.tiktokapis.com/v2/user/info/';
const TIKTOK_VIDEO_LIST_ENDPOINT = 'https://open.tiktokapis.com/v2/video/list/';

// Placeholder for a user's OAuth 2.0 access token (loaded from TIKTOK_ACCESS_TOKEN in .env if set)
export const TIKTOK_OAUTH_ACCESS_TOKEN_PLACEHOLDER =
  'YOUR_TIKTOK_OAUTH_ACCESS_TOKEN_HERE';

const USER_INFO_FIELDS = [
  'open_id',
  'union_id',
  'avatar_url',
  'display_name',
  'bio_description',
  'follower_count',
  'following_count',
  'likes_count',
  'video_count',
].join(',');

const VIDEO_LIST_FIELDS = [
  'id',
  'title',
  'video_description',
  'duration',
  'cover_image_url',
  'share_url',
  'view_count',
  'like_count',
  'comment_count',
  'share_count',
  'create_time',
].join(',');

export const getSocialPostMetricsDeclaration: FunctionDeclaration = {
  name: 'get_social_post_metrics',
  description:
    'Fetches the user\'s TikTok profile stats (/v2/user/info/) and recent video metrics (/v2/video/list/) via the official TikTok Display API using the user\'s OAuth access token.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      max_videos: {
        type: Type.NUMBER,
        description:
          'Maximum number of recent TikTok videos to retrieve from /v2/video/list/ (1 to 20). Defaults to 10.',
      },
      include_user_info: {
        type: Type.BOOLEAN,
        description:
          'Whether to also fetch account-level follower and total like counts from /v2/user/info/. Defaults to true.',
      },
    },
  },
};

export async function fetchTikTokUserInfo(
  accessToken: string
): Promise<Record<string, unknown>> {
  const url = `${TIKTOK_USER_INFO_ENDPOINT}?fields=${encodeURIComponent(
    USER_INFO_FIELDS
  )}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  const body = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    return {
      ok: false,
      httpStatus: response.status,
      endpoint: TIKTOK_USER_INFO_ENDPOINT,
      error: body,
    };
  }

  return {
    ok: true,
    endpoint: TIKTOK_USER_INFO_ENDPOINT,
    data: body.data ?? body,
  };
}

export async function fetchTikTokVideoList(
  accessToken: string,
  maxCount = 10
): Promise<Record<string, unknown>> {
  const boundedCount = Math.min(Math.max(Math.trunc(maxCount) || 10, 1), 20);
  const url = `${TIKTOK_VIDEO_LIST_ENDPOINT}?fields=${encodeURIComponent(
    VIDEO_LIST_FIELDS
  )}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      max_count: boundedCount,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    return {
      ok: false,
      httpStatus: response.status,
      endpoint: TIKTOK_VIDEO_LIST_ENDPOINT,
      error: body,
    };
  }

  return {
    ok: true,
    endpoint: TIKTOK_VIDEO_LIST_ENDPOINT,
    data: body.data ?? body,
  };
}

export async function getSocialPostMetrics(args: {
  max_videos?: number;
  include_user_info?: boolean;
}): Promise<Record<string, unknown>> {
  const accessToken =
    env.tiktokAccessToken || TIKTOK_OAUTH_ACCESS_TOKEN_PLACEHOLDER;
  const maxVideos = typeof args.max_videos === 'number' ? args.max_videos : 10;
  const includeUserInfo = args.include_user_info !== false;

  if (!hasConfiguredTikTokToken()) {
    return {
      status: 'unconfigured_oauth_token',
      platform: 'TikTok Display API v2',
      endpoints: {
        userInfo: `${TIKTOK_USER_INFO_ENDPOINT}?fields=${USER_INFO_FIELDS}`,
        videoList: `${TIKTOK_VIDEO_LIST_ENDPOINT}?fields=${VIDEO_LIST_FIELDS}`,
      },
      oauthTokenPlaceholder: TIKTOK_OAUTH_ACCESS_TOKEN_PLACEHOLDER,
      message:
        'TikTok OAuth access token is currently set to the placeholder value. Set TIKTOK_ACCESS_TOKEN in server/.env with a valid user OAuth 2.0 Bearer token (scopes: user.info.basic, user.info.stats, video.list) to fetch live TikTok metrics.',
    };
  }

  try {
    const [userInfoResult, videoListResult] = await Promise.all([
      includeUserInfo ? fetchTikTokUserInfo(accessToken) : Promise.resolve(null),
      fetchTikTokVideoList(accessToken, maxVideos),
    ]);

    return {
      status: 'ok',
      platform: 'TikTok Display API v2',
      userInfo: userInfoResult,
      videoList: videoListResult,
    };
  } catch (error) {
    return {
      status: 'network_error',
      platform: 'TikTok Display API v2',
      endpoints: {
        userInfo: TIKTOK_USER_INFO_ENDPOINT,
        videoList: TIKTOK_VIDEO_LIST_ENDPOINT,
      },
      error:
        error instanceof Error
          ? error.message
          : 'Failed to reach TikTok Display API endpoints.',
    };
  }
}
