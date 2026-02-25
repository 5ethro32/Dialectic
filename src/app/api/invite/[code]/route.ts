import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('cases')
    .select(`
      id, title, description, mode, status, created_at,
      creator:profiles!cases_created_by_fkey(display_name, avatar_url),
      positions(*)
    `)
    .eq('invite_code', code)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
