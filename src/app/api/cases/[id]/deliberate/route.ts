import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { runDeliberation } from '@/lib/ai/judges';
import { NextResponse } from 'next/server';
import { JUDGE_CONFIG, type JudgeKey } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify case is in submitted status
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select(`
      *,
      creator:profiles!cases_created_by_fkey(*),
      opponent:profiles!cases_opponent_id_fkey(*)
    `)
    .eq('id', id)
    .single();

  if (caseError || !caseData) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  if (caseData.status !== 'submitted') {
    return NextResponse.json({ error: 'Case is not ready for deliberation' }, { status: 400 });
  }

  // Update status to deliberating
  const serviceClient = await createServiceRoleClient();
  await serviceClient
    .from('cases')
    .update({ status: 'deliberating', updated_at: new Date().toISOString() })
    .eq('id', id);

  // Fetch both briefs and positions
  const { data: briefs } = await serviceClient
    .from('briefs')
    .select('*')
    .eq('case_id', id)
    .eq('status', 'submitted');

  const { data: positions } = await serviceClient
    .from('positions')
    .select('*')
    .eq('case_id', id);

  if (!briefs || briefs.length < 2 || !positions) {
    return NextResponse.json({ error: 'Briefs or positions missing' }, { status: 400 });
  }

  // Determine participant A (creator) and B (opponent)
  const briefA = briefs.find(b => b.user_id === caseData.created_by)!;
  const briefB = briefs.find(b => b.user_id === caseData.opponent_id)!;
  const positionA = positions.find(p => p.user_id === caseData.created_by)!;
  const positionB = positions.find(p => p.user_id === caseData.opponent_id)!;

  try {
    // Run the full deliberation
    const result = await runDeliberation({
      briefA,
      briefB,
      positionA,
      positionB,
      profileA: caseData.creator,
      profileB: caseData.opponent,
      caseTitle: caseData.title,
      caseDescription: caseData.description,
    }, user.id);

    const { opinions, chiefOpinion } = result;

    // Count votes
    const forVotes = opinions.filter(o => o.verdict_for === 'for').length +
      (chiefOpinion.verdict_for === 'for' ? 1 : 0);
    const againstVotes = opinions.filter(o => o.verdict_for === 'against').length +
      (chiefOpinion.verdict_for === 'against' ? 1 : 0);

    const winningSide = forVotes > againstVotes ? 'for' : againstVotes > forVotes ? 'against' : 'split';
    const majorVotes = Math.max(forVotes, againstVotes);
    const minorVotes = 5 - majorVotes;
    const winningMargin = majorVotes === 5 ? 'unanimous' : `${majorVotes}-${minorVotes}`;

    // Save verdict
    const { data: verdict, error: verdictError } = await serviceClient
      .from('verdicts')
      .insert({
        case_id: id,
        majority_summary: chiefOpinion.majority_opinion || null,
        synthesis: chiefOpinion.synthesis || null,
        winning_side: winningSide,
        winning_margin: winningMargin,
        dissenting_opinions: chiefOpinion.dissenting_summary ? { summary: chiefOpinion.dissenting_summary } : null,
        unresolved_questions: chiefOpinion.unresolved_questions || null,
        recommendations: chiefOpinion.recommendations || null,
        raw_responses: { opinions, chiefOpinion },
      })
      .select()
      .single();

    if (verdictError || !verdict) {
      throw new Error('Failed to save verdict: ' + verdictError?.message);
    }

    // Save individual judge opinions
    const judgeKeys: JudgeKey[] = ['empiricist', 'logician', 'contrarian', 'pragmatist'];
    for (let i = 0; i < opinions.length; i++) {
      const opinion = opinions[i];
      const judgeKey = judgeKeys[i];
      const config = JUDGE_CONFIG[judgeKey];

      await serviceClient.from('judge_opinions').insert({
        verdict_id: verdict.id,
        judge_key: judgeKey,
        judge_display_name: config.name,
        judge_title: config.title,
        verdict_for: opinion.verdict_for || 'abstain',
        reasoning: opinion.reasoning || 'No reasoning provided',
        score_participant_a: opinion.score_a || null,
        score_participant_b: opinion.score_b || null,
        notable_moments: opinion.notable_moments || null,
      });
    }

    // Save Chief Justice opinion
    const chiefConfig = JUDGE_CONFIG.chief_justice;
    await serviceClient.from('judge_opinions').insert({
      verdict_id: verdict.id,
      judge_key: 'chief_justice',
      judge_display_name: chiefConfig.name,
      judge_title: chiefConfig.title,
      verdict_for: chiefOpinion.verdict_for || 'split',
      reasoning: chiefOpinion.majority_opinion || 'No opinion provided',
      score_participant_a: chiefOpinion.score_a || null,
      score_participant_b: chiefOpinion.score_b || null,
      notable_moments: null,
    });

    // Update case status to verdict
    await serviceClient
      .from('cases')
      .update({ status: 'verdict', updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ verdict_id: verdict.id, winning_side: winningSide, winning_margin: winningMargin });

  } catch (error) {
    // Revert status on failure
    await serviceClient
      .from('cases')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', id);

    const errorMessage = error instanceof Error ? error.message : 'Deliberation failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
