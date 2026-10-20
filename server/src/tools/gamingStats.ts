import { FunctionDeclaration, Type } from '@google/genai';
import { env, hasConfiguredTrnApiKey } from '../config/env';

const TRN_APEX_BASE_URL =
  'https://public-api.tracker.gg/apex/v1/standard/profile';

export interface TrnStatEntry {
  metadata?: {
    key?: string;
    name?: string;
    categoryKey?: string;
    categoryName?: string;
    isReversed?: boolean;
  };
  value?: number;
  percentile?: number;
  rank?: number;
  displayValue?: string;
  displayRank?: string;
}

export interface TrnApexProfileResponse {
  data?: {
    id?: string;
    type?: string;
    metadata?: {
      platformId?: number;
      platformSlug?: string;
      platformUserHandle?: string;
      accountId?: string;
      cacheExpireDate?: string;
      level?: number;
    };
    stats?: TrnStatEntry[];
    children?: Array<{
      id?: string;
      type?: string;
      metadata?: {
        legend_name?: string;
        icon?: string;
        bgimage?: string;
        is_active?: boolean;
      };
      stats?: TrnStatEntry[];
    }>;
  };
  errors?: Array<{ message?: string }>;
}

export const getPlayerGameStatsDeclaration: FunctionDeclaration = {
  name: 'get_player_game_stats',
  description:
    'Fetches live Apex Legends player statistics from the Tracker Network API (https://public-api.tracker.gg/apex/v1/standard/profile/{platform}/{username}).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      platform: {
        type: Type.STRING,
        description:
          'Platform identifier for Tracker Network Apex API: "5" (or "origin"/"pc"), "2" (or "psn"/"playstation"), or "1" (or "xbl"/"xbox"). Defaults to TRN_DEFAULT_PLATFORM ("5").',
      },
      username: {
        type: Type.STRING,
        description:
          'Player username / gamer tag on the specified platform. Uses TRN_DEFAULT_USERNAME if omitted.',
      },
    },
    required: ['username'],
  },
};

function normalizeTrnPlatform(rawPlatform?: string): string {
  const value = (rawPlatform || env.trnDefaultPlatform || '5')
    .trim()
    .toLowerCase();

  switch (value) {
    case '5':
    case 'pc':
    case 'origin':
    case 'steam':
      return '5';
    case '2':
    case 'psn':
    case 'ps4':
    case 'ps5':
    case 'playstation':
      return '2';
    case '1':
    case 'xbl':
    case 'xbox':
      return '1';
    default:
      return value;
  }
}

export async function getPlayerGameStats(args: {
  platform?: string;
  username?: string;
}): Promise<Record<string, unknown>> {
  const platform = normalizeTrnPlatform(args.platform);
  const username = (args.username || env.trnDefaultUsername || '').trim();

  if (!username) {
    return {
      status: 'error',
      error:
        'A player username is required to query the Tracker Network Apex Legends API. Please provide a username (and optional platform: PC/Origin, PSN, or Xbox) or set TRN_DEFAULT_USERNAME in server/.env.',
    };
  }

  if (!hasConfiguredTrnApiKey()) {
    return {
      status: 'unconfigured',
      endpoint: `${TRN_APEX_BASE_URL}/${platform}/${encodeURIComponent(username)}`,
      error:
        'TRN_API_KEY is not configured in server/.env. Set TRN_API_KEY to your Tracker Network API key to fetch live Apex Legends stats.',
    };
  }

  const url = `${TRN_APEX_BASE_URL}/${encodeURIComponent(
    platform
  )}/${encodeURIComponent(username)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'TRN-Api-Key': env.trnApiKey,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: 'api_error',
        httpStatus: response.status,
        endpoint: url,
        error: `Tracker Network API returned HTTP ${response.status}`,
        details: errorText.slice(0, 500),
      };
    }

    const payload = (await response.json()) as TrnApexProfileResponse;
    const profile = payload.data;

    const overviewStats: Record<string, { value?: number; displayValue?: string; percentile?: number }> = {};
    for (const stat of profile?.stats ?? []) {
      const key = stat.metadata?.key || stat.metadata?.name;
      if (key) {
        overviewStats[key] = {
          value: stat.value,
          displayValue: stat.displayValue,
          percentile: stat.percentile,
        };
      }
    }

    const legends = (profile?.children ?? []).map((child) => ({
      legendName: child.metadata?.legend_name,
      isActive: Boolean(child.metadata?.is_active),
      stats: (child.stats ?? []).map((s) => ({
        name: s.metadata?.name || s.metadata?.key,
        value: s.value,
        displayValue: s.displayValue,
      })),
    }));

    return {
      status: 'ok',
      source: 'Tracker Network Apex Legends API v1',
      endpoint: url,
      player: {
        username: profile?.metadata?.platformUserHandle || username,
        platformId: profile?.metadata?.platformId ?? platform,
        level: profile?.metadata?.level,
      },
      overviewStats,
      legends,
    };
  } catch (error) {
    return {
      status: 'network_error',
      endpoint: url,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to reach Tracker Network API.',
    };
  }
}
