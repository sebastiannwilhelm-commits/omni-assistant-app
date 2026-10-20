import { Content, GoogleGenAI, Part } from '@google/genai';
import { env, hasConfiguredGeminiApiKey } from '../config/env';
import { executeToolCall, toolDeclarations } from '../tools';

const SYSTEM_INSTRUCTION = `You are Omni-Assistant, a friendly and insightful personal AI stats assistant for gamers and content creators.
You have access to two live API tools:
1. "get_player_game_stats": queries the Tracker Network API (https://public-api.tracker.gg/apex/v1/standard/profile/{platform}/{username}) for Apex Legends stats using the TRN-Api-Key header.
2. "get_social_post_metrics": queries the TikTok Display API (/v2/user/info/ and /v2/video/list/) using the user's OAuth 2.0 Bearer access token.

Always call the appropriate tool(s) when the user asks about their Apex Legends performance or TikTok analytics. If a tool reports that an API key, username, or OAuth token is not yet configured in server/.env, clearly explain what environment variable or parameter is needed.`;

export interface AssistantChatResult {
  reply: string;
  toolsUsed: string[];
}

export async function runAssistantChat(
  prompt: string
): Promise<AssistantChatResult> {
  if (!hasConfiguredGeminiApiKey()) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in server/.env.'
    );
  }

  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
  const toolsUsed: string[] = [];

  const contents: Content[] = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const maxTurns = 5;
  for (let turn = 0; turn < maxTurns; turn++) {
    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: toolDeclarations }],
      },
    });

    const functionCalls = response.functionCalls;
    if (!functionCalls || functionCalls.length === 0) {
      return {
        reply:
          response.text?.trim() ||
          'I checked your stats, but could not generate a summary right now.',
        toolsUsed,
      };
    }

    const modelCandidateContent = response.candidates?.[0]?.content;
    if (modelCandidateContent) {
      contents.push(modelCandidateContent);
    }

    const functionResponseParts: Part[] = await Promise.all(
      functionCalls.map(async (call) => {
        const toolName = call.name || 'unknown_tool';
        const toolArgs = (call.args as Record<string, unknown>) || {};
        toolsUsed.push(toolName);

        const result = await executeToolCall(toolName, toolArgs);

        return {
          functionResponse: {
            id: call.id,
            name: toolName,
            response: result,
          },
        };
      })
    );

    contents.push({
      role: 'user',
      parts: functionResponseParts,
    });
  }

  return {
    reply:
      'I gathered your gaming and social metrics, but reached the maximum tool-calling depth before completing the summary.',
    toolsUsed,
  };
}
