import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.CLAUDE_API_KEY;

if (!apiKey) {
  throw new Error('CLAUDE_API_KEY environment variable is not set');
}

export const claudeClient = new Anthropic({
  apiKey: apiKey,
});

export const MODEL = 'claude-opus-4-6';
export const MAX_TOKENS = 4500;
