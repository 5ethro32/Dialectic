import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

  // Submit the user's brief
  const { data: brief, error: briefError } = await supabase
    .from('briefs')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('case_id', id)
    .eq('user_id', user.id)
    .eq('status', 'draft')
    .select()
    .single();

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 400 });
  }

  // Check if both briefs are now submitted
  const { data: allBriefs } = await supabase
    .from('briefs')
    .select('status')
    .eq('case_id', id);

  const allSubmitted = allBriefs && allBriefs.length >= 2 && allBriefs.every(b => b.status === 'submitted');

  if (allSubmitted) {
    // Update case status to submitted
    await supabase
      .from('cases')
      .update({
        status: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  }

  return NextResponse.json({ brief, all_submitted: allSubmitted });
}
