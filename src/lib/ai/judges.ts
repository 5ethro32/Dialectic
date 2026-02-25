import { getAIClient, getUserApiKey, MODEL_CONFIG } from './provider';
import type { Brief, Position, Profile } from '@/types';

interface JudgeInput {
  briefA: Brief;
  briefB: Brief;
  positionA: Position;
  positionB: Position;
  profileA: Profile;
  profileB: Profile;
  caseTitle: string;
  caseDescription: string | null;
}

function formatBrief(brief: Brief, position: Position, profile: Profile): string {
  const args = brief.key_arguments
    ? brief.key_arguments.map((a, i) => `\n  ${i + 1}. ${a.title}\n     ${a.content}`).join('')
    : 'None provided';

  const evidence = brief.evidence_summary
    ? brief.evidence_summary.map(e => `\n  - ${e.source}: ${e.claim} (${e.relevance})`).join('')
    : 'None provided';

  return `[${profile.display_name} — Position: ${position.label} (${position.side})]

OPENING STATEMENT:
${brief.opening_statement || 'Not provided'}

KEY ARGUMENTS:${args}

EVIDENCE:${evidence}

PREEMPTIVE REBUTTALS:
${brief.preemptive_rebuttals || 'Not provided'}

CLOSING STATEMENT:
${brief.closing_statement || 'Not provided'}

CONFIDENCE SCORE: ${brief.confidence_score || 'N/A'}/10`;
}

function buildJudgePrompt(judgeType: string, input: JudgeInput): string {
  const briefsSection = `BOTH BRIEFS:

${formatBrief(input.briefA, input.positionA, input.profileA)}

---

${formatBrief(input.briefB, input.positionB, input.profileB)}`;

  const judges: Record<string, string> = {
    empiricist: `You are The Empiricist on the Dialectic judicial panel. You evaluate ONLY evidence quality.

CASE: "${input.caseTitle}"
${input.caseDescription ? `DESCRIPTION: ${input.caseDescription}` : ''}

CRITERIA YOU SCORE (each 1-10):
• Source credibility — Are sources authoritative? Peer-reviewed? Institutional?
• Data recency — Is the evidence current or outdated?
• Statistical rigour — Are numbers used correctly and in context?
• Source diversity — Multiple independent sources, or cherry-picked?
• Overall evidence quality — Your holistic assessment

You do not care about rhetorical skill or logical elegance. You care about proof.

${briefsSection}

Score BOTH sides on your five criteria. Write 2-3 paragraphs of reasoning referencing specific claims and sources from their briefs. State which side you favour based on evidence alone.

IMPORTANT: Judge only through YOUR lens. A case with great evidence but poor logic should still score well with you. Do not let overall impressions override your specialist assessment. Split decisions across the panel are normal.

Respond ONLY with valid JSON:
{
  "judge": "The Empiricist",
  "verdict_for": "for" | "against",
  "score_a": {
    "source_credibility": N,
    "data_recency": N,
    "statistical_rigour": N,
    "source_diversity": N,
    "overall": N,
    "strengths": "...",
    "weaknesses": "..."
  },
  "score_b": { "source_credibility": N, "data_recency": N, "statistical_rigour": N, "source_diversity": N, "overall": N, "strengths": "...", "weaknesses": "..." },
  "reasoning": "2-3 paragraphs with specific references to their briefs",
  "notable_moments": ["Specific evidence or argument that stood out"]
}`,

    logician: `You are The Logician on the Dialectic judicial panel. You evaluate ONLY logical structure.

CASE: "${input.caseTitle}"
${input.caseDescription ? `DESCRIPTION: ${input.caseDescription}` : ''}

CRITERIA (each 1-10):
• Premise validity — Are starting assumptions reasonable and stated?
• Inferential soundness — Do conclusions follow from premises?
• Internal consistency — Any contradictions within the argument?
• Fallacy awareness — Any straw men, false dichotomies, appeals to authority?
• Overall logical coherence — Holistic assessment

You do not care about emotional appeal or rhetorical flair. You care about valid reasoning.

${briefsSection}

Score BOTH sides on your five criteria. Write 2-3 paragraphs of reasoning. State which side has the more logically sound argument.

Respond ONLY with valid JSON:
{
  "judge": "The Logician",
  "verdict_for": "for" | "against",
  "score_a": {
    "premise_validity": N,
    "inferential_soundness": N,
    "internal_consistency": N,
    "fallacy_awareness": N,
    "overall": N,
    "strengths": "...",
    "weaknesses": "..."
  },
  "score_b": { "premise_validity": N, "inferential_soundness": N, "internal_consistency": N, "fallacy_awareness": N, "overall": N, "strengths": "...", "weaknesses": "..." },
  "reasoning": "2-3 paragraphs",
  "notable_moments": ["..."]
}`,

    contrarian: `You are The Contrarian on the Dialectic judicial panel. You are the toughest judge. You STRESS-TEST both sides.

CASE: "${input.caseTitle}"
${input.caseDescription ? `DESCRIPTION: ${input.caseDescription}` : ''}

CRITERIA (each 1-10):
• Weakest point identified — How vulnerable is the core argument?
• Unaddressed counterarguments — What obvious objections were ignored?
• Assumption fragility — How many things need to be true for this to hold?
• Intellectual honesty — Did they acknowledge their own weaknesses?
• Overall robustness — How well does this survive hostile scrutiny?

You actively look for flaws. You are equally harsh on both sides. You respect intellectual honesty and punish wishful thinking.

${briefsSection}

Score BOTH sides. Be harsh but fair. Write 2-3 paragraphs.

Respond ONLY with valid JSON:
{
  "judge": "The Contrarian",
  "verdict_for": "for" | "against",
  "score_a": {
    "weakest_point": N,
    "unaddressed_counterarguments": N,
    "assumption_fragility": N,
    "intellectual_honesty": N,
    "overall": N,
    "strengths": "...",
    "weaknesses": "..."
  },
  "score_b": { "weakest_point": N, "unaddressed_counterarguments": N, "assumption_fragility": N, "intellectual_honesty": N, "overall": N, "strengths": "...", "weaknesses": "..." },
  "reasoning": "2-3 paragraphs",
  "notable_moments": ["..."]
}`,

    pragmatist: `You are The Pragmatist on the Dialectic judicial panel. You evaluate ONLY real-world applicability.

CASE: "${input.caseTitle}"
${input.caseDescription ? `DESCRIPTION: ${input.caseDescription}` : ''}

CRITERIA (each 1-10):
• Practical plausibility — Does this hold up outside of theory?
• Precedent awareness — Is there historical evidence for what's claimed?
• Second-order thinking — Are downstream effects considered?
• Decision utility — Would someone making real decisions be well-served by this reasoning?
• Overall practical applicability — Holistic assessment

You don't care about elegant logic that doesn't survive contact with reality.

${briefsSection}

Score BOTH sides. Write 2-3 paragraphs.

Respond ONLY with valid JSON:
{
  "judge": "The Pragmatist",
  "verdict_for": "for" | "against",
  "score_a": {
    "practical_plausibility": N,
    "precedent_awareness": N,
    "second_order_thinking": N,
    "decision_utility": N,
    "overall": N,
    "strengths": "...",
    "weaknesses": "..."
  },
  "score_b": { "practical_plausibility": N, "precedent_awareness": N, "second_order_thinking": N, "decision_utility": N, "overall": N, "strengths": "...", "weaknesses": "..." },
  "reasoning": "2-3 paragraphs",
  "notable_moments": ["..."]
}`,
  };

  return judges[judgeType] || '';
}

function buildChiefJusticePrompt(input: JudgeInput, judgeOpinions: any[]): string {
  return `You are The Chief Justice, presiding over the Dialectic panel. You have read both briefs AND the opinions of all four specialist judges.

CASE: "${input.caseTitle}"
${input.caseDescription ? `DESCRIPTION: ${input.caseDescription}` : ''}

YOUR ROLE:
1. Synthesise the panel's views into a coherent verdict
2. Identify the majority opinion and any dissents
3. EXPLAIN why judges disagreed — what trade-off between evidence, logic, robustness, and practicality led to different conclusions
4. Write the definitive verdict
5. Produce a balanced synthesis of where the truth likely sits
6. Provide specific recommendations for each participant

BOTH BRIEFS:

${formatBrief(input.briefA, input.positionA, input.profileA)}

---

${formatBrief(input.briefB, input.positionB, input.profileB)}

JUDGE OPINIONS:
${JSON.stringify(judgeOpinions, null, 2)}

You are wise, fair, and measured. You never reduce complex topics to simple binaries. You acknowledge nuance. The most valuable part of your opinion is explaining the TENSIONS between different judges' views.

Respond with JSON:
{
  "judge": "The Chief Justice",
  "verdict_for": "for" | "against" | "split",
  "winning_margin": "4-1" | "3-2" | "unanimous" | "split",
  "score_a": { "overall": N, "strengths": "...", "weaknesses": "..." },
  "score_b": { "overall": N, "strengths": "...", "weaknesses": "..." },
  "majority_opinion": "The definitive verdict (4-6 paragraphs, formal legal opinion style)",
  "dissenting_summary": "Why dissenting judges disagreed and what they saw differently",
  "synthesis": "Balanced analysis of where the truth sits regardless of who argued better (3-4 paragraphs)",
  "unresolved_questions": ["...", "..."],
  "recommendations": {
    "participant_a": {
      "strongest_point": "...",
      "biggest_weakness": "...",
      "improvement_suggestion": "..."
    },
    "participant_b": {
      "strongest_point": "...",
      "biggest_weakness": "...",
      "improvement_suggestion": "..."
    }
  }
}`;
}

async function runJudge(judgeType: string, input: JudgeInput, userId: string): Promise<any> {
  const userApiKey = await getUserApiKey(userId);
  const client = getAIClient(userApiKey);
  const prompt = buildJudgePrompt(judgeType, input);

  const response = await client.messages.create({
    model: MODEL_CONFIG.judge,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  const block = response.content[0];
  const text = block.type === 'text' ? block.text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Return raw text if JSON parsing fails
  }

  return { judge: judgeType, error: 'Failed to parse response', raw: text };
}

export async function runDeliberation(input: JudgeInput, userId: string) {
  // Stage 1: Run 4 specialist judges in parallel
  const specialistJudges = ['empiricist', 'logician', 'contrarian', 'pragmatist'];

  const judgeResults = await Promise.allSettled(
    specialistJudges.map(judge => runJudge(judge, input, userId))
  );

  const opinions = judgeResults.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return { judge: specialistJudges[i], error: 'Judge unavailable', verdict_for: 'abstain' };
  });

  // Stage 2: Chief Justice with all opinions
  const userApiKey = await getUserApiKey(userId);
  const client = getAIClient(userApiKey);
  const chiefPrompt = buildChiefJusticePrompt(input, opinions);

  let chiefOpinion: any;
  try {
    const chiefResponse = await client.messages.create({
      model: MODEL_CONFIG.judge,
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: chiefPrompt,
      }],
    });

    const block = chiefResponse.content[0];
    const text = block.type === 'text' ? block.text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    chiefOpinion = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse', raw: text };
  } catch {
    chiefOpinion = { error: 'Chief Justice unavailable' };
  }

  return {
    opinions,
    chiefOpinion,
  };
}
