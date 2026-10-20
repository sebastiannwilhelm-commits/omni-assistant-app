import { FunctionDeclaration } from '@google/genai';
import {
  getPlayerGameStats,
  getPlayerGameStatsDeclaration,
} from './gamingStats';
import {
  getSocialPostMetrics,
  getSocialPostMetricsDeclaration,
} from './socialStats';

export const toolDeclarations: FunctionDeclaration[] = [
  getPlayerGameStatsDeclaration,
  getSocialPostMetricsDeclaration,
];

export async function executeToolCall(
  name: string,
  args: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  switch (name) {
    case 'get_player_game_stats':
      return await getPlayerGameStats({
        platform:
          typeof args.platform === 'string' ? args.platform : undefined,
        username:
          typeof args.username === 'string' ? args.username : undefined,
      });

    case 'get_social_post_metrics':
      return await getSocialPostMetrics({
        max_videos:
          typeof args.max_videos === 'number' ? args.max_videos : undefined,
        include_user_info:
          typeof args.include_user_info === 'boolean'
            ? args.include_user_info
            : undefined,
      });

    default:
      return {
        error: `Unknown tool "${name}". Available tools: get_player_game_stats, get_social_post_metrics.`,
      };
  }
}
