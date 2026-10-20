import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

interface ChatRequestBody {
  prompt?: string;
}

interface ChatResponseBody {
  reply: string;
  timestamp: string;
}

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'omni-assistant-server',
    timestamp: new Date().toISOString(),
  });
});

app.post('/chat', (req: Request<Record<string, never>, ChatResponseBody | { error: string }, ChatRequestBody>, res: Response) => {
  const { prompt } = req.body ?? {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({
      error: 'A non-empty "prompt" string is required.',
    });
    return;
  }

  const trimmedPrompt = prompt.trim();

  res.status(200).json({
    reply: `Omni-Assistant (placeholder): I received your question — "${trimmedPrompt}". Your gaming & social media stats integrations will be connected here soon!`,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Omni-Assistant Server] Listening on http://localhost:${PORT}`);
});
