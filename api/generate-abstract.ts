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

export default async (req: any, res: any) => {
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
    const body: GenerateAbstractRequest = req.body;

    if (!body.abstractText || !body.studyType || !body.outcome || !body.effectSize) {
      return
