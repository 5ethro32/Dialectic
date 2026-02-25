import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      creator:profiles!cases_created_by_fkey(*),
      opponent:profiles!cases_opponent_id_fkey(*),
      positions(*)
    `)
    .or(`created_by.eq.${user.id},opponent_id.eq.${user.id}`)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, mode, position_label, position_side } = await request.json();

  // Create the case
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .insert({
      title,
      description,
      mode: mode || 'adversarial',
      created_by: user.id,
      status: 'draft',
    })
    .select()
    .single();

  if (caseError) {
    return NextResponse.json({ error: caseError.message }, { status: 400 });
  }

  // Create the creator's position
  if (position_label) {
    await supabase.from('positions').insert({
      case_id: caseData.id,
      user_id: user.id,
      label: position_label,
      side: position_side || 'for',
    });
  }

  // Create an empty brief for the user
  await supabase.from('briefs').insert({
    case_id: caseData.id,
    user_id: user.id,
  });

  return NextResponse.json(caseData, { status: 201 });
}
