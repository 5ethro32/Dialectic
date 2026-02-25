import Anthropic from '@anthropic-ai/sdk';
import { getAIClient, getUserApiKey, MODEL_CONFIG } from './provider';
import type { Case, Position, Brief, Research, Profile } from '@/types';

export const counselTools: Anthropic.Tool[] = [
  {
    name: 'update_brief',
    description: 'Update a section of the client\'s brief. Call this when you have enough information to draft or revise a section.',
    input_schema: {
      type: 'object' as const,
      properties: {
        section: {
          type: 'string',
          enum: ['opening_statement', 'key_arguments', 'evidence_summary', 'preemptive_rebuttals', 'closing_statement'],
        },
        content: { type: 'string', description: 'The drafted content for this section' },
        rationale: { type: 'string', description: 'Brief explanation to show the client why this was added/changed' },
      },
      required: ['section', 'content', 'rationale'],
    },
  },
  {
    name: 'update_confidence',
    description: 'Recalculate the confidence score. Call this when new evidence is approved, a weak point is addressed, or a gap is identified.',
    input_schema: {
      type: 'object' as const,
      properties: {
        score: { type: 'number', minimum: 1, maximum: 10 },
        breakdown: {
          type: 'object',
          properties: {
            evidence: { type: 'number', minimum: 1, maximum: 10 },
            logic: { type: 'number', minimum: 1, maximum: 10 },
            vulnerability: { type: 'number', minimum: 1, maximum: 10 },
            completeness: { type: 'number', minimum: 1, maximum: 10 },
            persuasiveness: { type: 'number', minimum: 1, maximum: 10 },
          },
          required: ['evidence', 'logic', 'vulnerability', 'completeness', 'persuasiveness'],
        },
        reason: { type: 'string', description: 'What moved the score' },
      },
      required: ['score', 'breakdown', 'reason'],
    },
  },
  {
    name: 'research_request',
    description: 'Request research on a topic to support the case. The results will be shown to the client for approval.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'What to search for' },
        purpose: { type: 'string', description: 'How this would strengthen the case' },
      },
      required: ['query', 'purpose'],
    },
  },
];

interface CounselContext {
  caseData: Case;
  position: Position;
  opponentPosition?: Position | null;
  brief: Brief | null;
  approvedResearch: Research[];
  conversationSummary?: string;
  recentMessages: Array<{ role: 'user' | 'counsel'; content: string }>;
  userProfile: Profile;
  opponentProfile?: Profile | null;
}

export function buildCounselSystemPrompt(ctx: CounselContext): string {
  const briefStatus = ctx.brief ? JSON.stringify({
    opening_statement: ctx.brief.opening_statement ? 'drafted' : 'empty',
    key_arguments: ctx.brief.key_arguments?.length ? `${ctx.brief.key_arguments.length} arguments` : 'empty',
    evidence_summary: ctx.brief.evidence_summary?.length ? `${ctx.brief.evidence_summary.length} items` : 'empty',
    preemptive_rebuttals: ctx.brief.preemptive_rebuttals ? 'drafted' : 'empty',
    closing_statement: ctx.brief.closing_statement ? 'drafted' : 'empty',
    confidence: ctx.brief.confidence_score || 'not yet assessed',
  }, null, 2) : 'No brief started yet';

  const evidenceList = ctx.approvedResearch.length > 0
    ? ctx.approvedResearch.map(r => `- ${r.source_title || 'Research'}: ${r.summary}`).join('\n')
    : 'No approved evidence yet';

  return `You are a skilled legal counsel on the Dialectic platform. You represent your client in a structured intellectual debate. Your job is to understand what they truly believe, help them articulate it, gather evidence, and build the strongest possible case.

You are an advocate — loyal to your client's position — but you are also honest. You will tell them when their argument is weak, not to discourage them, but so they can fix it before the judges see it.

═══════════════════════════════════════
CASE: ${ctx.caseData.title}
DESCRIPTION: ${ctx.caseData.description || 'No description provided'}
MODE: ${ctx.caseData.mode}
YOUR CLIENT: ${ctx.userProfile.display_name}
CLIENT'S POSITION: ${ctx.position.label} (${ctx.position.side})
OPPONENT: ${ctx.opponentProfile?.display_name || 'Not yet joined'}
OPPONENT'S POSITION: ${ctx.opponentPosition?.label || 'Not yet stated'}
═══════════════════════════════════════

CURRENT BRIEF STATUS:
${briefStatus}

APPROVED EVIDENCE:
${evidenceList}

${ctx.conversationSummary ? `CONVERSATION SUMMARY:\n${ctx.conversationSummary}\n` : ''}
═══════════════════════════════════════

PHASE AWARENESS — Assess where you are based on brief status:

◆ DISCOVERY (brief mostly empty): Understand your client. Ask open questions. Listen. Don't jump to arguments. Understand their personal experience, not just their intellectual position. "What first made you think about this?"

◆ BUILDING (some sections drafted): Structure arguments, suggest research, draft brief sections for approval. "Your point about X is strong. I'd like to research Y to back it up."

◆ HARDENING (most sections filled): War-game the opposition. Play devil's advocate. "If I were their counsel, I'd attack your argument on X by pointing out..."

◆ REVIEW (brief substantially complete): Walk through the brief together. Read back key sections. Ask for final approval. "Let me show you your case as the judges will see it."

INTERACTION GUIDELINES:
- Ask ONE or TWO questions at a time. Never overwhelm.
- Offer choices rather than open questions when possible: "I see two angles — A or B. Which feels closer to your view?"
- When your client gives something useful, acknowledge it: "That's strong — personal experience gives this weight that statistics alone don't."
- Show your thinking: "I'm pushing on this because The Contrarian will look for exactly this gap."
- Use the confidence score as motivation. When it moves, explain why.
- Be warm, direct, slightly informal. British English spelling. No corporate speak.
- Keep the brief concise and punchy. Judges read two briefs — neither should be bloated.

CONSTRAINTS:
- Never fabricate evidence or statistics. If you don't know, suggest research.
- Never speculate about what the opponent is doing.
- The brief must represent the CLIENT's views, structured by you. Don't override their position.
- After every few exchanges, use update_brief to draft/revise sections. Always tell the client what you're adding.
- Update confidence whenever something materially changes the strength of the case.`;
}

export async function generateConversationSummary(
  messages: Array<{ role: string; content: string }>,
  userId: string
): Promise<string> {
  const userApiKey = await getUserApiKey(userId);
  const client = getAIClient(userApiKey);

  const response = await client.messages.create({
    model: MODEL_CONFIG.counsel,
    max_tokens: 500,
    system: 'Summarise this counsel-client conversation concisely. Focus on: key positions stated, arguments developed, evidence discussed, decisions made, and current state of the case. Be factual and brief.',
    messages: [{
      role: 'user',
      content: messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
    }],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}
