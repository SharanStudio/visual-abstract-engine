export interface AbstractMetadata {
  abstractText: string;
  studyType: 'RCT' | 'Cohort' | 'Cross-sectional' | 'Outbreak' | 'Surveillance';
  population: string;
  intervention?: string;
  outcome: string;
  effectSize: string;
  tone: 'common-man' | 'academic';
}

export const buildGenerationPrompt = (metadata: AbstractMetadata): string => {
  const { abstractText, studyType, population, intervention, outcome, effectSize, tone } = metadata;

  const toneGuidance = 
    tone === 'common-man' 
      ? 'Use simple, everyday language. Avoid medical jargon. Explain any technical terms briefly. Write as if explaining to a general educated audience.'
      : 'Use professional academic language appropriate for health researchers.';

  const studyTypeGuidance = getStudyTypeGuidance(studyType);

  return `You are an expert at creating modern, accessible health communication visual abstracts for social media. Your task is to parse a research abstract and generate a beautiful, data-forward HTML design for a 1:1 square (for social media).

ABSTRACT TO ANALYZE:
${abstractText}

STUDY METADATA:
- Study Type: ${studyType}
- Population: ${population}
${intervention ? `- Intervention/Exposure: ${intervention}` : ''}
- Primary Outcome: ${outcome}
- Effect Size/Key Finding: ${effectSize}
- Tone: ${toneGuidance}

${studyTypeGuidance}

YOUR TASK:
1. Extract the core finding and its significance
2. Identify what makes this research important for the general/target audience
3. Create a visual hierarchy (headline → finding → implication)
4. Generate ONLY a clean, modern HTML artifact (1:1 square, 1200×1200px viewport)

DESIGN REQUIREMENTS:
- Modern typography (use web-safe fonts or Google Fonts URLs)
- Clean layout with clear visual hierarchy
- Colour palette should reflect study type (see guidance above)
- Include key numbers/data prominently
- Add ICMR branding placeholder (will be positioned via drag-drop)
- No external images except via data URIs
- Must be valid HTML/CSS only
- Responsive: looks good at any square size from 200×200 to 1200×1200

OUTPUT FORMAT:
Return ONLY a JSON object with this exact structure:
{
  "headline": "string - 1-2 sentences, compelling",
  "studyType": "${studyType}",
  "population": "string",
  "primaryFinding": "string - the key result with effect size",
  "secondaryFinding": "string or null",
  "implication": "string - why this matters",
  "designSuggestions": {
    "colourPalette": "warm-earth|cool-scientific|urgent-red|vibrant-modern|clinical-blue|warm-community",
    "layout": "string - brief description of layout choice",
    "emphasis": "string - what to emphasize visually"
  },
  "htmlArtifact": "string - complete, valid HTML for 1:1 square. Include CSS in <style> tag. No external dependencies."
}

IMPORTANT:
- The HTML must be complete and self-contained
- Must include <html>, <head>, <body> tags
- CSS must be inline or in <style> tag
- The design should be publication-quality
- Preserve all factual accuracy from the abstract
- Make it visually engaging for social media
- Ensure text is readable at small sizes`;
};

export const buildChatPrompt = (params: {
  currentHTML: string;
  userRequest: string;
  abstractMetadata: AbstractMetadata;
  conversationHistory: Array<{ role: string; content: string }>;
}): string => {
  const { currentHTML, userRequest, abstractMetadata, conversationHistory } = params;

  const historyContext = conversationHistory
    .map((msg, i) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  return `You are an expert visual design assistant for health research communications. A user is iterating on a visual abstract design.

CURRENT ARTIFACT (HTML):
\`\`\`html
${currentHTML}
\`\`\`

ABSTRACT DATA:
- Headline: ${abstractMetadata.abstractText.slice(0, 100)}...
- Study Type: ${abstractMetadata.studyType}
- Population: ${abstractMetadata.population}
- Effect Size: ${abstractMetadata.effectSize}
- Tone: ${abstractMetadata.tone}

EDIT HISTORY:
${historyContext || '(No prior edits)'}

USER REQUEST:
${userRequest}

YOUR TASK:
1. Update the HTML artifact based on the user's request
2. Preserve factual accuracy - flag if request would distort the finding
3. Maintain modern design standards
4. Ensure the updated HTML remains valid and self-contained

CONSTRAINTS:
- Only modify CSS and HTML structure
- Keep all factual data intact
- Preserve ICMR branding placeholder positions
- Ensure text remains readable
- No external dependencies

OUTPUT FORMAT:
Return ONLY a JSON object:
{
  "html": "string - updated complete HTML artifact",
  "explanation": "string - brief explanation of what changed and why",
  "accuracy_note": "string or null - flag if request could distort findings"
}`;
};

function getStudyTypeGuidance(studyType: string): string {
  const guidance: Record<string, string> = {
    'RCT': 'Visual emphasis: forward momentum, efficacy proof. Lead with effect size and confidence interval. Use comparison visual (before/after or treatment/control).',
    'Cohort': 'Visual emphasis: follow-up, longitudinal trend. Show trajectory over time. Lead with association strength (HR/RR with CI).',
    'Cross-sectional': 'Visual emphasis: snapshot, prevalence, burden. Use proportion/percentage visuals. Show demographic breakdown if relevant.',
    'Outbreak': 'Visual emphasis: urgency, epicurve, containment. Lead with cases, dates, geography. Use timeline or map concepts.',
    'Surveillance': 'Visual emphasis: trend, public health action. Show time-series or hotspot concept. Lead with surveillance metric and geographic or temporal pattern.'
  };
  
  return guidance[studyType] || 'Visual emphasis: data-forward, modern, accessible to general audience.';
}
