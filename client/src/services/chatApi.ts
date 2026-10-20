import { API_BASE_URL } from '../config/api';

export interface ChatResponse {
  reply: string;
  timestamp: string;
}

export async function sendChatPrompt(prompt: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    let errorMessage = `Server responded with status ${response.status}`;
    try {
      const errorData = (await response.json()) as { error?: string };
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Fall back to default status message
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as ChatResponse;
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
