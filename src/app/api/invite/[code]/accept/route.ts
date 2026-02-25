import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { position_label, position_side } = await request.json();

  // Find the case by invite code
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('invite_code', code)
    .single();

  if (caseError || !caseData) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  if (caseData.created_by === user.id) {
    return NextResponse.json({ error: 'You cannot join your own case' }, { status: 400 });
  }

  if (caseData.opponent_id) {
    return NextResponse.json({ error: 'This case already has an opponent' }, { status: 400 });
  }

  // Update the case with the opponent
  const { error: updateError } = await supabase
    .from('cases')
    .update({
      opponent_id: user.id,
      status: 'consulting',
      updated_at: new Date().toISOString(),
    })
    .eq('id', caseData.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // Create opponent's position
  await supabase.from('positions').insert({
    case_id: caseData.id,
    user_id: user.id,
    label: position_label,
    side: position_side || 'against',
  });

  // Create empty brief for opponent
  await supabase.from('briefs').insert({
    case_id: caseData.id,
    user_id: user.id,
  });

  return NextResponse.json({ case_id: caseData.id });
}
