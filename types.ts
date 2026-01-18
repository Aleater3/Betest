
export interface Option {
  label: string;
  score: number;
}

export interface Question {
  pillar: string;
  text: string;
  options: Option[];
}

export enum AuditStage {
  INTRO = 'INTRO',
  QUIZ = 'QUIZ',
  CAPTURE = 'CAPTURE',
  CALCULATING = 'CALCULATING',
  RESULT = 'RESULT'
}

export interface AuditResult {
  percentage: number;
  tier: string;
  color: string;
  dossierTitle: string;
  description: string;
}
