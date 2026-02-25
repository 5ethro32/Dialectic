// Database types matching the Supabase schema

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  encrypted_api_key: string | null;
  theme_preference: 'light' | 'dark' | 'system';
  created_at: string;
}

export interface Case {
  id: string;
  title: string;
  description: string | null;
  mode: 'adversarial' | 'inquiry' | 'challenge';
  status: 'draft' | 'consulting' | 'submitted' | 'deliberating' | 'verdict' | 'reopened';
  created_by: string;
  opponent_id: string | null;
  invite_code: string;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  creator?: Profile;
  opponent?: Profile;
  positions?: Position[];
}

export interface Position {
  id: string;
  case_id: string;
  user_id: string;
  label: string;
  side: 'for' | 'against' | 'exploring';
  created_at: string;
}

export interface CounselMessage {
  id: string;
  case_id: string;
  user_id: string;
  role: 'user' | 'counsel';
  content: string;
  message_type: 'text' | 'research_card' | 'confidence_update' | 'brief_update' | 'system';
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface Research {
  id: string;
  case_id: string;
  user_id: string;
  query: string | null;
  source_url: string | null;
  source_title: string | null;
  summary: string;
  relevance_score: number | null;
  approved_by_user: boolean;
  created_at: string;
}

export interface Brief {
  id: string;
  case_id: string;
  user_id: string;
  opening_statement: string | null;
  key_arguments: KeyArgument[] | null;
  evidence_summary: EvidenceSummary[] | null;
  preemptive_rebuttals: string | null;
  closing_statement: string | null;
  confidence_score: number | null;
  confidence_breakdown: ConfidenceBreakdown | null;
  completeness: BriefCompleteness | null;
  status: 'draft' | 'submitted';
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KeyArgument {
  title: string;
  content: string;
  evidence_ids?: string[];
}

export interface EvidenceSummary {
  source: string;
  claim: string;
  relevance: string;
}

export interface ConfidenceBreakdown {
  evidence: number;
  logic: number;
  vulnerability: number;
  completeness: number;
  persuasiveness: number;
}

export interface BriefCompleteness {
  opening: boolean;
  arguments: string; // e.g. "2/3"
  evidence: boolean;
  rebuttals: boolean;
  closing: boolean;
}

export interface Verdict {
  id: string;
  case_id: string;
  majority_summary: string | null;
  synthesis: string | null;
  winning_side: 'for' | 'against' | 'split' | null;
  winning_margin: string | null;
  dissenting_opinions: any | null;
  unresolved_questions: string[] | null;
  recommendations: Record<string, any> | null;
  raw_responses: any | null;
  created_at: string;
}

export interface JudgeOpinion {
  id: string;
  verdict_id: string;
  judge_key: 'empiricist' | 'logician' | 'contrarian' | 'pragmatist' | 'chief_justice';
  judge_display_name: string;
  judge_title: string;
  verdict_for: 'for' | 'against' | 'abstain';
  reasoning: string;
  score_participant_a: JudgeScore | null;
  score_participant_b: JudgeScore | null;
  notable_moments: string[] | null;
  created_at: string;
}

export interface JudgeScore {
  overall: number;
  strengths: string;
  weaknesses: string;
  breakdown?: Record<string, number>;
}

export interface JournalNote {
  id: string;
  case_id: string | null;
  user_id: string;
  content: string;
  created_at: string;
}

export type JudgeKey = 'empiricist' | 'logician' | 'contrarian' | 'pragmatist' | 'chief_justice';

export const JUDGE_CONFIG: Record<JudgeKey, { name: string; title: string; color: string; }> = {
  empiricist: { name: 'The Empiricist', title: 'Evidence Specialist', color: '#3B82F6' },
  logician: { name: 'The Logician', title: 'Logic Specialist', color: '#8B5CF6' },
  contrarian: { name: 'The Contrarian', title: 'Stress-Test Specialist', color: '#EF4444' },
  pragmatist: { name: 'The Pragmatist', title: 'Practicality Specialist', color: '#F59E0B' },
  chief_justice: { name: 'The Chief Justice', title: 'Presiding Judge', color: '#1B6D6D' },
};
