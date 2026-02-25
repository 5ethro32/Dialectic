import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAIClient, getUserApiKey, MODEL_CONFIG } from '@/lib/ai/provider';
import { counselTools, buildCounselSystemPrompt, generateConversationSummary } from '@/lib/ai/counsel';
import { conductResearch } from '@/lib/ai/research';
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

  const { data, error } = await supabase
    .from('counsel_messages')
    .select('*')
    .eq('case_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data || []);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { message } = await request.json();

  // Save the user's message
  await supabase.from('counsel_messages').insert({
    case_id: id,
    user_id: user.id,
    role: 'user',
    content: message,
    message_type: 'text',
  });

  // Fetch all needed context
  const [caseResult, positionsResult, briefResult, researchResult, messagesResult, profileResult] = await Promise.all([
    supabase.from('cases').select('*, creator:profiles!cases_created_by_fkey(*), opponent:profiles!cases_opponent_id_fkey(*)').eq('id', id).single(),
    supabase.from('positions').select('*').eq('case_id', id),
    supabase.from('briefs').select('*').eq('case_id', id).eq('user_id', user.id).single(),
    supabase.from('research').select('*').eq('case_id', id).eq('user_id', user.id).eq('approved_by_user', true),
    supabase.from('counsel_messages').select('*').eq('case_id', id).eq('user_id', user.id).order('created_at', { ascending: true }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ]);

  const caseData = caseResult.data;
  const positions = positionsResult.data || [];
  const brief = briefResult.data;
  const approvedResearch = researchResult.data || [];
  const allMessages = messagesResult.data || [];
  const userProfile = profileResult.data;

  if (!caseData || !userProfile) {
    return new Response(JSON.stringify({ error: 'Case not found' }), { status: 404 });
  }

  const userPosition = positions.find((p: any) => p.user_id === user.id);
  const opponentPosition = positions.find((p: any) => p.user_id !== user.id);
  const opponentProfile = caseData.created_by === user.id ? caseData.opponent : caseData.creator;

  if (!userPosition) {
    return new Response(JSON.stringify({ error: 'No position set' }), { status: 400 });
  }

  // Build conversation summary if needed
  let conversationSummary: string | undefined;
  const recentMessages = allMessages.slice(-10);

  if (allMessages.length > 20) {
    const olderMessages = allMessages.slice(0, -10);
    try {
      conversationSummary = await generateConversationSummary(
        olderMessages.map((m: any) => ({ role: m.role, content: m.content })),
        user.id
      );
    } catch {
      // Continue without summary if it fails
    }
  }

  // Build system prompt
  const systemPrompt = buildCounselSystemPrompt({
    caseData,
    position: userPosition,
    opponentPosition: opponentPosition || null,
    brief,
    approvedResearch,
    conversationSummary,
    recentMessages: recentMessages.map((m: any) => ({ role: m.role === 'user' ? 'user' : 'counsel', content: m.content })),
    userProfile,
    opponentProfile: opponentProfile || null,
  });

  // Build messages array for Claude
  const claudeMessages = recentMessages.map((m: any) => ({
    role: m.role === 'user' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }));

  // Stream the response
  const userApiKey = await getUserApiKey(user.id);
  const client = getAIClient(userApiKey);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullResponse = '';
        let toolResults: any[] = [];

        // Keep looping until we get a final text response (handle tool use)
        let currentMessages = [...claudeMessages];
        let continueLoop = true;

        while (continueLoop) {
          const response = await client.messages.create({
            model: MODEL_CONFIG.counsel,
            max_tokens: 2000,
            system: systemPrompt,
            tools: counselTools,
            messages: currentMessages,
          });

          // Process each content block
          for (const block of response.content) {
            if (block.type === 'text') {
              fullResponse += block.text;
              // Send text chunks
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: block.text })}\n\n`));
            } else if (block.type === 'tool_use') {
              // Handle tool calls
              const toolName = block.name;
              const toolInput = block.input as any;

              if (toolName === 'update_brief') {
                // Update the brief in the database
                const updateData: Record<string, any> = {
                  updated_at: new Date().toISOString(),
                };

                if (toolInput.section === 'key_arguments') {
                  // Parse as array or add to existing
                  const existingArgs = brief?.key_arguments || [];
                  try {
                    const newArg = JSON.parse(toolInput.content);
                    updateData.key_arguments = [...existingArgs, newArg];
                  } catch {
                    updateData.key_arguments = [...existingArgs, { title: 'Argument', content: toolInput.content }];
                  }
                } else if (toolInput.section === 'evidence_summary') {
                  const existingEvidence = brief?.evidence_summary || [];
                  try {
                    const newEvidence = JSON.parse(toolInput.content);
                    updateData.evidence_summary = [...existingEvidence, newEvidence];
                  } catch {
                    updateData.evidence_summary = [...existingEvidence, { source: 'Research', claim: toolInput.content, relevance: 'Supporting' }];
                  }
                } else {
                  updateData[toolInput.section] = toolInput.content;
                }

                // Calculate completeness
                const updatedBrief = { ...brief, ...updateData };
                updateData.completeness = {
                  opening: !!updatedBrief.opening_statement,
                  arguments: `${(updatedBrief.key_arguments || []).length}/3`,
                  evidence: (updatedBrief.evidence_summary || []).length > 0,
                  rebuttals: !!updatedBrief.preemptive_rebuttals,
                  closing: !!updatedBrief.closing_statement,
                };

                await supabase
                  .from('briefs')
                  .update(updateData)
                  .eq('case_id', id)
                  .eq('user_id', user.id);

                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'brief_update',
                  section: toolInput.section,
                  rationale: toolInput.rationale,
                  completeness: updateData.completeness,
                })}\n\n`));

                toolResults.push({
                  type: 'tool_result' as const,
                  tool_use_id: block.id,
                  content: `Brief section "${toolInput.section}" updated successfully. Rationale: ${toolInput.rationale}`,
                });

              } else if (toolName === 'update_confidence') {
                await supabase
                  .from('briefs')
                  .update({
                    confidence_score: toolInput.score,
                    confidence_breakdown: toolInput.breakdown,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('case_id', id)
                  .eq('user_id', user.id);

                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'confidence_update',
                  score: toolInput.score,
                  breakdown: toolInput.breakdown,
                  reason: toolInput.reason,
                })}\n\n`));

                // Save as a system message
                await supabase.from('counsel_messages').insert({
                  case_id: id,
                  user_id: user.id,
                  role: 'counsel',
                  content: `Confidence updated to ${toolInput.score}/10: ${toolInput.reason}`,
                  message_type: 'confidence_update',
                  metadata: { score: toolInput.score, breakdown: toolInput.breakdown, reason: toolInput.reason },
                });

                toolResults.push({
                  type: 'tool_result' as const,
                  tool_use_id: block.id,
                  content: `Confidence score updated to ${toolInput.score}/10. Reason: ${toolInput.reason}`,
                });

              } else if (toolName === 'research_request') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'research_started',
                  query: toolInput.query,
                  purpose: toolInput.purpose,
                })}\n\n`));

                try {
                  const userPosition = positions.find((p: any) => p.user_id === user.id);
                  const result = await conductResearch(
                    toolInput.query,
                    toolInput.purpose,
                    caseData.title,
                    userPosition?.label || '',
                    user.id
                  );

                  // Save research to database
                  const { data: researchData } = await supabase
                    .from('research')
                    .insert({
                      case_id: id,
                      user_id: user.id,
                      query: toolInput.query,
                      source_url: result.source_url,
                      source_title: result.source_title,
                      summary: result.summary,
                      relevance_score: result.relevance_score,
                    })
                    .select()
                    .single();

                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'research_card',
                    research: researchData,
                  })}\n\n`));

                  // Save as research card message
                  await supabase.from('counsel_messages').insert({
                    case_id: id,
                    user_id: user.id,
                    role: 'counsel',
                    content: `Research found: ${result.source_title}\n\n${result.summary}`,
                    message_type: 'research_card',
                    metadata: researchData,
                  });

                  toolResults.push({
                    type: 'tool_result' as const,
                    tool_use_id: block.id,
                    content: `Research completed: "${result.source_title}" — ${result.summary.slice(0, 200)}... The client can now approve or reject this research.`,
                  });
                } catch {
                  toolResults.push({
                    type: 'tool_result' as const,
                    tool_use_id: block.id,
                    content: 'Research failed. Suggest the client verify this topic independently.',
                  });
                }
              }
            }
          }

          // If there were tool uses, continue the conversation with tool results
          if (toolResults.length > 0 && response.stop_reason === 'tool_use') {
            currentMessages = [
              ...currentMessages,
              { role: 'assistant' as const, content: response.content },
              { role: 'user' as const, content: toolResults },
            ];
            toolResults = [];
          } else {
            continueLoop = false;
          }
        }

        // Save the final counsel message
        if (fullResponse) {
          await supabase.from('counsel_messages').insert({
            case_id: id,
            user_id: user.id,
            role: 'counsel',
            content: fullResponse,
            message_type: 'text',
          });
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: errorMessage })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
