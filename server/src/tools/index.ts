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

export function executeToolCall(
  name: string,
  args: Record<string, unknown> = {}
): Record<string, unknown> {
  switch (name) {
    case 'get_player_game_stats':
      return {
        ...getPlayerGameStats({
          game_title:
            typeof args.game_title === 'string' ? args.game_title : undefined,
          time_range:
            typeof args.time_range === 'string' ? args.time_range : undefined,
        }),
      };

    case 'get_social_post_metrics':
      return {
        ...getSocialPostMetrics({
          platform:
            typeof args.platform === 'string' ? args.platform : undefined,
          metric_focus:
            typeof args.metric_focus === 'string'
              ? args.metric_focus
              : undefined,
        }),
      };

    default:
      return {
        error: `Unknown tool "${name}". Available tools: get_player_game_stats, get_social_post_metrics.`,
      };
  }
}
