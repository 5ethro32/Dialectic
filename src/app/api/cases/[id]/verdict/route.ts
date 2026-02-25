import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: verdict, error } = await supabase
    .from('verdicts')
    .select('*')
    .eq('case_id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'No verdict found' }, { status: 404 });
  }

  const { data: opinions } = await supabase
    .from('judge_opinions')
    .select('*')
    .eq('verdict_id', verdict.id)
    .order('created_at');

  // Get briefs for both participants
  const { data: briefs } = await supabase
    .from('briefs')
    .select(`*, user:profiles!briefs_user_id_fkey(display_name)`)
    .eq('case_id', id);

  return NextResponse.json({
    verdict,
    opinions: opinions || [],
    briefs: briefs || [],
  });
}
