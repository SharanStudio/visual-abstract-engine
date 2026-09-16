import { VercelRequest, VercelResponse } from '@vercel/node';
import { claudeClient, MODEL } from '../utils/claudeClient';
import { buildChatPrompt, AbstractMetadata } from '../utils/promptEngine';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  currentHTML: string;
  userMessage: string;
  conversationHistory: ChatMessage[];
  abstractMetadata: AbstractMetadata;
  tone: 'common-man' | 'academic';
}

interface ChatResponse {
  html: string;
  explanation: string;
  accuracy_note?: string;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: ChatRequest = req.body;

    if (!body.currentHTML || !body.userMessage || !body.abstractMetadata) {
      return res.status(400).json({ 
        error: 'Missing required fields: currentHTML, userMessage, abstractMetadata' 
      });
    }

    const metadata: AbstractMetadata = {
      ...body.abstractMetadata,
      tone: body.tone || body.abstractMetadata.tone
    };

    const prompt = buildChatPrompt({
      currentHTML: body.currentHTML,
      userRequest: body.userMessage,
      abstractMetadata: metadata,
      conversationHistory: body.conversationHistory || []
    });

    const messages = [
      ...(body.conversationHistory || []).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: prompt
      }
    ];

    const message = await claudeClient.messages.create({
      model: MODEL,
      max_tokens: 2500,
      messages: messages
    });

    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('');

    let chatResponse: ChatResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      chatResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return res.status(500).json({ 
        error: 'Failed to parse chat
