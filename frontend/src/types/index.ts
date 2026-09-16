export interface AbstractData {
  headline: string;
  studyType: "RCT" | "Cohort" | "Cross-sectional" | "Outbreak" | "Surveillance";
  population: string;
  intervention: string;
  outcome: string;
  effectSize: string;
  implication: string;
}

export interface ArtifactState {
  html: string;
  metadata: AbstractData;
  logos: LogoData[];
  colourPalette: string;
  tone: "common-man" | "academic";
  editHistory: EditRecord[];
}

export interface LogoData {
  id: string;
  name: string;
  base64: string;
  position: { top: number; right: number };
  size: { width: number; height: number };
}

export interface EditRecord {
  timestamp: number;
  userMessage: string;
  claudeExplanation: string;
  html: string;
}
