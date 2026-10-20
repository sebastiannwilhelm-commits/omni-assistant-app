import express, { Request, Response } from 'express';
import cors from 'cors';
import { env, hasConfiguredGeminiApiKey } from './config/env';
import { runAssistantChat } from './services/geminiService';

const app = express();

app.use(cors());
app.use(express.json());

interface ChatRequestBody {
  prompt?: string;
}

interface ChatResponseBody {
  reply: string;
  toolsUsed?: string[];
  timestamp: string;
}

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'omni-assistant-server',
    geminiConfigured: hasConfiguredGeminiApiKey(),
    timestamp: new Date().toISOString(),
  });
});

app.post(
  '/chat',
  async (
    req: Request<
      Record<string, never>,
      ChatResponseBody | { error: string },
      ChatRequestBody
    >,
    res: Response
  ) => {
    const { prompt } = req.body ?? {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({
        error: 'A non-empty "prompt" string is required.',
      });
      return;
    }

    try {
      const { reply, toolsUsed } = await runAssistantChat(prompt.trim());

      res.status(200).json({
        reply,
        toolsUsed,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to process chat request with Gemini.';
      console.error('[/chat Error]:', message);

      res.status(500).json({
        error: message,
      });
    }
  }
);

app.listen(env.port, '0.0.0.0', () => {
  console.log(
    `[Omni-Assistant Server] Listening on http://localhost:${env.port} (Gemini API key configured: ${hasConfiguredGeminiApiKey()})`
  );
});
