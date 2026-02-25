import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all cases the user participated in with verdicts
  const { data: cases } = await supabase
    .from('cases')
    .select(`
      *,
      creator:profiles!cases_created_by_fkey(display_name),
      opponent:profiles!cases_opponent_id_fkey(display_name),
      positions(*),
      verdicts(*),
      briefs!inner(confidence_score, status)
    `)
    .or(`created_by.eq.${user.id},opponent_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  // Get journal notes
  const { data: notes } = await supabase
    .from('journal_notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ cases: cases || [], notes: notes || [] });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { case_id, content } = await request.json();

  const { data, error } = await supabase
    .from('journal_notes')
    .insert({
      case_id,
      user_id: user.id,
      content,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
