import { FunctionDeclaration, Type } from '@google/genai';

export interface PlayerGameStats {
  gameTitle: string;
  timeRange: string;
  matchesPlayed: number;
  kills: number;
  deaths: number;
  kdRatio: number;
  winRatePercent: number;
  headshotPercent: number;
  hoursPlayed: number;
  signatureLoadoutOrHero: string;
  recentTrend: string;
}

export const getPlayerGameStatsDeclaration: FunctionDeclaration = {
  name: 'get_player_game_stats',
  description:
    'Retrieves the user\'s personal gaming performance statistics (kills, deaths, K/D ratio, win rate, matches played, and recent trend) for a specified game title such as Apex Legends, Call of Duty: Warzone, Valorant, Fortnite, or Steam titles.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      game_title: {
        type: Type.STRING,
        description:
          'Name of the game title to query (e.g., "Apex Legends", "Warzone", "Valorant", "Fortnite", "Counter-Strike 2").',
      },
      time_range: {
        type: Type.STRING,
        description:
          'Optional time window for the stats, such as "this_week", "last_month", or "lifetime". Defaults to "this_week".',
      },
    },
    required: ['game_title'],
  },
};

const MOCK_GAME_DATABASE: Record<string, Omit<PlayerGameStats, 'timeRange'>> = {
  apex: {
    gameTitle: 'Apex Legends',
    matchesPlayed: 42,
    kills: 118,
    deaths: 64,
    kdRatio: 1.84,
    winRatePercent: 14.3,
    headshotPercent: 22.5,
    hoursPlayed: 16.5,
    signatureLoadoutOrHero: 'Wraith (R-301 + Peacekeeper)',
    recentTrend: '+12% K/D improvement compared to last week',
  },
  warzone: {
    gameTitle: 'Call of Duty: Warzone',
    matchesPlayed: 31,
    kills: 149,
    deaths: 72,
    kdRatio: 2.07,
    winRatePercent: 16.1,
    headshotPercent: 27.8,
    hoursPlayed: 14.2,
    signatureLoadoutOrHero: 'MCW + HRM-9 Overkill',
    recentTrend: '3 top-3 finishes in the last 5 matches',
  },
  valorant: {
    gameTitle: 'Valorant',
    matchesPlayed: 19,
    kills: 342,
    deaths: 261,
    kdRatio: 1.31,
    winRatePercent: 57.9,
    headshotPercent: 29.4,
    hoursPlayed: 12.8,
    signatureLoadoutOrHero: 'Jett / Omen (Vandal)',
    recentTrend: 'Promoted to Ascendant II (+48 RR net this week)',
  },
  fortnite: {
    gameTitle: 'Fortnite',
    matchesPlayed: 27,
    kills: 96,
    deaths: 23,
    kdRatio: 4.17,
    winRatePercent: 18.5,
    headshotPercent: 24.0,
    hoursPlayed: 9.4,
    signatureLoadoutOrHero: 'Zero Build Ranked',
    recentTrend: '5 Crowned Victory Royales this week',
  },
};

export function getPlayerGameStats(args: {
  game_title?: string;
  time_range?: string;
}): PlayerGameStats {
  const rawTitle = (args.game_title || 'Apex Legends').trim();
  const timeRange = (args.time_range || 'this_week').trim();
  const normalized = rawTitle.toLowerCase();

  if (normalized.includes('apex')) {
    return { ...MOCK_GAME_DATABASE.apex, timeRange };
  }
  if (normalized.includes('warzone') || normalized.includes('cod') || normalized.includes('call of duty')) {
    return { ...MOCK_GAME_DATABASE.warzone, timeRange };
  }
  if (normalized.includes('valorant') || normalized.includes('val')) {
    return { ...MOCK_GAME_DATABASE.valorant, timeRange };
  }
  if (normalized.includes('fortnite')) {
    return { ...MOCK_GAME_DATABASE.fortnite, timeRange };
  }

  // Deterministic fallback for any other requested game title
  return {
    gameTitle: rawTitle,
    timeRange,
    matchesPlayed: 24,
    kills: 87,
    deaths: 58,
    kdRatio: 1.5,
    winRatePercent: 54.2,
    headshotPercent: 21.0,
    hoursPlayed: 11.3,
    signatureLoadoutOrHero: 'All-Rounder Main',
    recentTrend: 'Steady upward trajectory over the last 10 sessions',
  };
}
