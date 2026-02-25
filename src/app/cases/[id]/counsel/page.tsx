'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfidenceGauge } from '@/components/ui/ConfidenceGauge';
import { Navbar } from '@/components/layout/Navbar';
import type {
  Case,
  Brief,
  CounselMessage,
  Research,
  Position,
  ConfidenceBreakdown,
  BriefCompleteness,
} from '@/types';

// ---------------------------------------------------------------------------
// Local types for the streaming chat
// ---------------------------------------------------------------------------

interface StreamMessage {
  id: string;
  role: 'user' | 'counsel';
  content: string;
  message_type: CounselMessage['message_type'];
  metadata?: Record<string, any> | null;
  isStreaming?: boolean;
}

// ---------------------------------------------------------------------------
// Helper: parse an individual SSE data payload
// ---------------------------------------------------------------------------

function parseSSELine(line: string): Record<string, any> | null {
  if (!line.startsWith('data: ')) return null;
  try {
    return JSON.parse(line.slice(6));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A single completeness row in the brief preview panel. */
function CompletenessRow({
  label,
  done,
  detail,
}: {
  label: string;
  done: boolean;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-bg">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {detail && <span className="text-xs text-text-secondary">{detail}</span>}
        {done ? (
          <svg
            className="w-4 h-4 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-border" />
        )}
      </div>
    </div>
  );
}

/** Breakdown row – shows label + value in the confidence breakdown. */
function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-mono text-text-primary">{value}</span>
    </div>
  );
}

/** Research card rendered inside the chat stream. */
function ResearchCard({
  msg,
  onApprove,
}: {
  msg: StreamMessage;
  onApprove: (meta: Record<string, any>) => void;
}) {
  const meta = msg.metadata;
  return (
    <Card className="border-primary/20">
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Research</Badge>
          {meta?.source_title && (
            <span className="text-sm font-medium">{meta.source_title}</span>
          )}
        </div>
        <p className="text-sm text-text-secondary whitespace-pre-wrap">
          {msg.content}
        </p>
        {meta?.source_url && (
          <a
            href={meta.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline break-all"
          >
            {meta.source_url}
          </a>
        )}
        {typeof meta?.relevance_score === 'number' && (
          <p className="text-xs text-text-secondary">
            Relevance: {(meta.relevance_score * 100).toFixed(0)}%
          </p>
        )}
        {meta && !meta.approved_by_user && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => onApprove(meta)}>
              Approve
            </Button>
            <Button size="sm" variant="ghost">
              Reject
            </Button>
          </div>
        )}
        {meta?.approved_by_user && <Badge variant="success">Approved</Badge>}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function CounselRoom() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  // ---- State ---------------------------------------------------------------
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [research, setResearch] = useState<Research[]>([]);
  const [userPosition, setUserPosition] = useState<Position | null>(null);
  const [opponentPosition, setOpponentPosition] = useState<Position | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showBriefPanel, setShowBriefPanel] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---- Helpers -------------------------------------------------------------
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ---- Load initial data ---------------------------------------------------
  useEffect(() => {
    if (!user || authLoading) return;

    const loadData = async () => {
      try {
        const [caseRes, messagesRes, briefRes, researchRes] = await Promise.all([
          fetch(`/api/cases/${caseId}`),
          fetch(`/api/cases/${caseId}/counsel`),
          fetch(`/api/cases/${caseId}/brief`),
          supabase
            .from('research')
            .select('*')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .order('created_at'),
        ]);

        if (caseRes.ok) {
          const c: Case = await caseRes.json();
          setCaseData(c);
          const uPos = c.positions?.find((p: Position) => p.user_id === user.id);
          const oPos = c.positions?.find((p: Position) => p.user_id !== user.id);
          setUserPosition(uPos ?? null);
          setOpponentPosition(oPos ?? null);
        }

        if (messagesRes.ok) {
          const msgs: CounselMessage[] = await messagesRes.json();
          setMessages(
            msgs.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              message_type: m.message_type,
              metadata: m.metadata,
            })),
          );
        }

        if (briefRes.ok) {
          setBrief(await briefRes.json());
        }

        if (researchRes.data) {
          setResearch(researchRes.data as Research[]);
        }
      } catch (error) {
        console.error('Failed to load counsel room data:', error);
      }
      setPageLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, caseId]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ---- Send message + SSE handling -----------------------------------------
  const handleSend = async () => {
    if (!input.trim() || isStreaming || !user) return;

    const messageText = input.trim();

    // Optimistically add user message
    const userMsg: StreamMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      message_type: 'text',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    // Add placeholder for the streaming counsel response
    const counselId = `counsel-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: counselId,
        role: 'counsel',
        content: '',
        message_type: 'text',
        isStreaming: true,
      },
    ]);

    try {
      const response = await fetch(`/api/cases/${caseId}/counsel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get counsel response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const data = parseSSELine(line);
          if (!data) continue;

          switch (data.type) {
            case 'text': {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === counselId
                    ? { ...m, content: m.content + data.content }
                    : m,
                ),
              );
              break;
            }

            case 'brief_update': {
              setBrief((prev) =>
                prev
                  ? { ...prev, completeness: data.completeness as BriefCompleteness }
                  : prev,
              );
              setMessages((prev) => [
                ...prev,
                {
                  id: `brief-${Date.now()}-${Math.random()}`,
                  role: 'counsel',
                  content: `Brief updated: ${(data.section as string).replace(/_/g, ' ')} \u2014 ${data.rationale}`,
                  message_type: 'brief_update',
                  metadata: data,
                },
              ]);
              break;
            }

            case 'confidence_update': {
              setBrief((prev) =>
                prev
                  ? {
                      ...prev,
                      confidence_score: data.score as number,
                      confidence_breakdown: data.breakdown as ConfidenceBreakdown,
                    }
                  : prev,
              );
              setMessages((prev) => [
                ...prev,
                {
                  id: `conf-${Date.now()}-${Math.random()}`,
                  role: 'counsel',
                  content: `Confidence: ${data.score}/10 \u2014 ${data.reason}`,
                  message_type: 'confidence_update',
                  metadata: data,
                },
              ]);
              break;
            }

            case 'research_started': {
              setMessages((prev) => [
                ...prev,
                {
                  id: `research-start-${Date.now()}-${Math.random()}`,
                  role: 'counsel',
                  content: `Researching: ${data.query}`,
                  message_type: 'system',
                  metadata: { purpose: data.purpose },
                },
              ]);
              break;
            }

            case 'research_card': {
              const r = data.research as Research | undefined;
              if (r) {
                setResearch((prev) => [...prev, r]);
              }
              setMessages((prev) => [
                ...prev,
                {
                  id: `research-${Date.now()}-${Math.random()}`,
                  role: 'counsel',
                  content: r?.summary || 'Research completed',
                  message_type: 'research_card',
                  metadata: r ?? null,
                },
              ]);
              break;
            }

            case 'error': {
              setMessages((prev) => [
                ...prev,
                {
                  id: `error-${Date.now()}-${Math.random()}`,
                  role: 'counsel',
                  content: `Error: ${data.message}`,
                  message_type: 'system',
                },
              ]);
              break;
            }

            // 'done' — nothing to do, loop will exit when stream closes
            default:
              break;
          }
        }
      }

      // Mark the counsel placeholder as no longer streaming
      setMessages((prev) =>
        prev.map((m) =>
          m.id === counselId ? { ...m, isStreaming: false } : m,
        ),
      );

      // Refresh brief state from server so we have the latest
      const briefRes = await fetch(`/api/cases/${caseId}/brief`);
      if (briefRes.ok) {
        setBrief(await briefRes.json());
      }
    } catch (error) {
      console.error('Counsel stream error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'counsel',
          content: 'Failed to get a response. Please try again.',
          message_type: 'system',
        },
      ]);
      // Remove the empty streaming placeholder if it exists
      setMessages((prev) =>
        prev.map((m) =>
          m.id === counselId ? { ...m, isStreaming: false } : m,
        ),
      );
    }

    setIsStreaming(false);
    inputRef.current?.focus();
  };

  // ---- Research approval ---------------------------------------------------
  const handleApproveResearch = async (researchMeta: Record<string, any>) => {
    if (!researchMeta?.id) return;

    const { error } = await supabase
      .from('research')
      .update({ approved_by_user: true })
      .eq('id', researchMeta.id);

    if (!error) {
      // Update local research list
      setResearch((prev) =>
        prev.map((r) =>
          r.id === researchMeta.id ? { ...r, approved_by_user: true } : r,
        ),
      );
      // Update the message card so the buttons disappear
      setMessages((prev) =>
        prev.map((m) =>
          m.metadata?.id === researchMeta.id
            ? { ...m, metadata: { ...m.metadata, approved_by_user: true } }
            : m,
        ),
      );
    }
  };

  // ---- Submit brief --------------------------------------------------------
  const handleSubmitBrief = async () => {
    if (
      !confirm(
        'Once submitted, your brief is final and will be visible to your opponent and the judges. Continue?',
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/cases/${caseId}/brief/submit`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setBrief((prev) => (prev ? { ...prev, status: 'submitted' } : prev));
        if (data.all_submitted) {
          router.push(`/cases/${caseId}`);
        }
      }
    } catch (error) {
      console.error('Failed to submit brief:', error);
    }
  };

  // ---- Keyboard shortcut ---------------------------------------------------
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---- Derived state -------------------------------------------------------
  const completeness: BriefCompleteness | null =
    (brief?.completeness as BriefCompleteness) ?? null;
  const breakdown: ConfidenceBreakdown | null =
    brief?.confidence_breakdown ?? null;
  const approvedResearch = research.filter((r) => r.approved_by_user);

  // "arguments" field is a string like "2/3"; parse it to check completion
  const argumentsComplete = (() => {
    if (!completeness?.arguments) return false;
    const parts = completeness.arguments.split('/');
    if (parts.length === 2) {
      const [current, required] = parts.map(Number);
      return current >= required;
    }
    return (brief?.key_arguments?.length ?? 0) >= 1;
  })();

  const isComplete =
    completeness &&
    completeness.opening &&
    completeness.evidence &&
    completeness.rebuttals &&
    completeness.closing &&
    argumentsComplete;

  // ---- Loading & guard states ----------------------------------------------
  if (authLoading || pageLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-text-secondary">
            Loading counsel room...
          </div>
        </div>
      </>
    );
  }

  if (!user || !caseData) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-text-secondary">
            Case not found or access denied.
          </p>
        </div>
      </>
    );
  }

  // ---- Render --------------------------------------------------------------
  return (
    <>
      <Navbar />

      {/* ====================== Header bar ====================== */}
      <div className="border-b border-border bg-surface px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/cases/${caseId}`}
              className="text-text-secondary hover:text-text-primary text-sm"
            >
              &larr; Back
            </Link>
            <div>
              <h1 className="font-display text-lg font-semibold">
                {caseData.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                {userPosition && (
                  <span>
                    Your position:{' '}
                    <Badge variant="primary">
                      {userPosition.side.toUpperCase()}
                    </Badge>{' '}
                    {userPosition.label}
                  </span>
                )}
                {opponentPosition && (
                  <span className="ml-2">vs {opponentPosition.label}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                caseData.status === 'consulting' ? 'primary' : 'default'
              }
            >
              {caseData.status}
            </Badge>
            {/* Mobile-only brief toggle */}
            <button
              onClick={() => setShowBriefPanel(!showBriefPanel)}
              className="lg:hidden p-2 rounded-lg border border-border text-sm"
              aria-label="Toggle brief panel"
            >
              Brief
            </button>
          </div>
        </div>
      </div>

      {/* =================== Main two-column layout =================== */}
      <div className="max-w-7xl mx-auto flex h-[calc(100vh-8.5rem)]">
        {/* --------------- Left: Chat panel --------------- */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Empty state */}
            {messages.length === 0 && (
              <div className="text-center py-12 text-text-secondary">
                <p className="font-display text-xl mb-2">
                  Your counsel is ready
                </p>
                <p className="text-sm">
                  Tell them about your position on this case. They will help you
                  build the strongest argument possible.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    msg.message_type === 'system' ||
                    msg.message_type === 'brief_update' ||
                    msg.message_type === 'confidence_update'
                      ? 'w-full max-w-full'
                      : ''
                  }`}
                >
                  {/* ---------- System / brief / confidence inline msgs ---------- */}
                  {msg.message_type === 'system' ||
                  msg.message_type === 'brief_update' ||
                  msg.message_type === 'confidence_update' ? (
                    <div
                      className={`text-center py-2 px-4 rounded-lg text-sm ${
                        msg.message_type === 'brief_update'
                          ? 'bg-primary/10 text-primary'
                          : msg.message_type === 'confidence_update'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-bg text-text-secondary'
                      }`}
                    >
                      {msg.message_type === 'confidence_update' &&
                        msg.metadata && (
                          <span className="font-mono font-bold mr-2">
                            {msg.metadata.score}/10
                          </span>
                        )}
                      {msg.content}
                    </div>
                  ) : /* ---------- Research cards ---------- */
                  msg.message_type === 'research_card' ? (
                    <ResearchCard
                      msg={msg}
                      onApprove={handleApproveResearch}
                    />
                  ) : (
                    /* ---------- Regular text messages ---------- */
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-counsel-bg text-text-primary rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-current opacity-50 animate-pulse ml-0.5" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-border p-4 bg-surface">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  brief?.status === 'submitted'
                    ? 'Brief submitted \u2014 case closed'
                    : 'Type your message...'
                }
                disabled={isStreaming || brief?.status === 'submitted'}
                className="flex-1 px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              />
              <Button
                onClick={handleSend}
                disabled={
                  !input.trim() ||
                  isStreaming ||
                  brief?.status === 'submitted'
                }
                loading={isStreaming}
              >
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* --------------- Right: Brief preview panel --------------- */}
        {/* Desktop: always visible. Mobile: toggled via state. */}
        <div
          className={`w-80 border-l border-border bg-surface overflow-y-auto ${
            showBriefPanel
              ? 'fixed inset-0 z-40 w-full lg:relative lg:w-80'
              : 'hidden lg:block'
          }`}
        >
          {/* Mobile close button */}
          {showBriefPanel && (
            <button
              onClick={() => setShowBriefPanel(false)}
              className="lg:hidden absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary"
              aria-label="Close brief panel"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <div className="p-4 space-y-6">
            {/* ---- Brief completeness checklist ---- */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-3">
                Brief Preview
              </h3>
              <div className="space-y-2">
                <CompletenessRow
                  label="Opening Statement"
                  done={!!completeness?.opening}
                />
                <CompletenessRow
                  label="Key Arguments"
                  done={argumentsComplete}
                  detail={completeness?.arguments}
                />
                <CompletenessRow
                  label="Evidence"
                  done={!!completeness?.evidence}
                />
                <CompletenessRow
                  label="Rebuttals"
                  done={!!completeness?.rebuttals}
                />
                <CompletenessRow
                  label="Closing Statement"
                  done={!!completeness?.closing}
                />
              </div>
            </div>

            {/* ---- Confidence gauge ---- */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-3">
                Confidence
              </h3>
              <div className="flex justify-center mb-3">
                <ConfidenceGauge score={brief?.confidence_score ?? 0} />
              </div>
              {breakdown && (
                <div className="space-y-1.5">
                  <BreakdownRow label="Evidence" value={breakdown.evidence} />
                  <BreakdownRow label="Logic" value={breakdown.logic} />
                  <BreakdownRow
                    label="Vulnerability"
                    value={breakdown.vulnerability}
                  />
                  <BreakdownRow
                    label="Completeness"
                    value={breakdown.completeness}
                  />
                  <BreakdownRow
                    label="Persuasion"
                    value={breakdown.persuasiveness}
                  />
                </div>
              )}
            </div>

            {/* ---- Approved evidence ---- */}
            {approvedResearch.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold mb-3">
                  Approved Evidence ({approvedResearch.length})
                </h3>
                <div className="space-y-2">
                  {approvedResearch.map((r) => (
                    <div key={r.id} className="p-2 rounded-lg bg-bg text-xs">
                      <p className="font-medium">
                        {r.source_title || 'Research'}
                      </p>
                      <p className="text-text-secondary mt-1 line-clamp-2">
                        {r.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---- Submit / status ---- */}
            {brief?.status === 'draft' && (
              <Button
                variant="accent"
                className="w-full"
                disabled={!isComplete}
                onClick={handleSubmitBrief}
              >
                Submit Brief
              </Button>
            )}
            {brief?.status === 'submitted' && (
              <div className="text-center py-3">
                <Badge variant="success">Brief Submitted</Badge>
              </div>
            )}

            {/* ---- Link to full brief ---- */}
            <Link
              href={`/cases/${caseId}/brief`}
              className="block text-center text-sm text-primary hover:text-primary-light"
            >
              View full brief &rarr;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
