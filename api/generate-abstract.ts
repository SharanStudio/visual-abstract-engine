import { VercelRequest, VercelResponse } from '@vercel/node';
import { claudeClient, MODEL, MAX_TOKENS } from '../utils/claudeClient';
import { buildGenerationPrompt, AbstractMetadata } from '../utils/promptEngine';

interface GenerateAbstractRequest {
  abstractText: string;
  studyType: 'RCT' | 'Cohort' | 'Cross-sectional' | 'Outbreak' | 'Surveillance';
  population: string;
  intervention?: string;
  outcome: string;
  effectSize: string;
  tone: 'common-man' | 'academic';
}

interface GeneratedArtifact {
  headline: string;
  studyType: string;
  population: string;
  primaryFinding: string;
  secondaryFinding: string | null;
  implication: string;
  designSuggestions: {
    colourPalette: string;
    layout: string;
    emphasis: string;
  };
  htmlArtifact: string;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: GenerateAbstractRequest = req.body;

    if (!body.abstractText || !body.studyType || !body.outcome || !body.effectSize) {
      return res.status(400).json({ 
        error: 'Missing required fields: abstractText, studyType, outcome, effectSize' 
      });
    }

    const metadata: AbstractMetadata = {
      abstractText: body.abstractText,
      studyType: body.studyType,
      population: body.population || 'Not specified',
      intervention: body.intervention,
      outcome: body.outcome,
      effectSize: body.effectSize,
      tone: body.tone || 'common-man'
    };

    const prompt = buildGenerationPrompt(metadata);

    const message = await claudeClient.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('');

    let artifact: GeneratedArtifact;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      artifact = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return res.status(500).json({ 
        error: 'Failed to parse generated artifact',
        details: parseError instanceof Error ? parseError.message : 'Unknown error'
      });
    }

    if (!artifact.htmlArtifact) {
      return res.status(500).json({ error: 'No HTML artifact generated' });
    }

    return res.status(200).json({
      success: true,
      artifact: artifact,
      metadata: metadata
    });

  } catch (error) {
    console.error('Generate abstract error:', error);
    return res.status(500).json({
      error: 'Failed to generate abstract',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
