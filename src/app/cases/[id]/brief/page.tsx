'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfidenceGauge } from '@/components/ui/ConfidenceGauge';
import type { Brief, ConfidenceBreakdown } from '@/types';

export default function BriefPage() {
  const params = useParams();
  const caseId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading) return;
    const loadBrief = async () => {
      try {
        const res = await fetch(`/api/cases/${caseId}/brief`);
        if (res.ok) setBrief(await res.json());
      } catch (e) {
        console.error('Failed to load brief:', e);
      }
      setLoading(false);
    };
    loadBrief();
  }, [user, authLoading, caseId]);

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-border rounded w-1/3" />
            <div className="h-64 bg-border rounded-card" />
          </div>
        </div>
      </>
    );
  }

  if (!brief) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-text-secondary">Brief not found.</p>
        </div>
      </>
    );
  }

  const breakdown = brief.confidence_breakdown as ConfidenceBreakdown | null;

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/cases/${caseId}`} className="text-text-secondary hover:text-text-primary text-sm">
            &larr; Back to case
          </Link>
          <Badge variant={brief.status === 'submitted' ? 'success' : 'default'}>
            {brief.status}
          </Badge>
        </div>

        <h1 className="font-display text-3xl font-bold mb-8">Your Brief</h1>

        {/* Confidence */}
        {brief.confidence_score !== null && brief.confidence_score !== undefined && (
          <div className="flex items-center gap-6 mb-8">
            <ConfidenceGauge score={brief.confidence_score} size="md" />
            {breakdown && (
              <div className="space-y-1 flex-1">
                {Object.entries(breakdown).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="text-text-secondary capitalize w-28">{key}</span>
                    <div className="flex-1 h-2 bg-border rounded-full overflow-hidden w-24">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${((val as number) / 10) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs w-6 text-right">{val as number}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Brief sections */}
        <div className="space-y-6">
          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold mb-3">Opening Statement</h2>
              {brief.opening_statement ? (
                <p className="font-reading leading-relaxed whitespace-pre-wrap">{brief.opening_statement}</p>
              ) : (
                <p className="text-text-secondary italic">Not yet drafted</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold mb-3">Key Arguments</h2>
              {brief.key_arguments && brief.key_arguments.length > 0 ? (
                <div className="space-y-4">
                  {brief.key_arguments.map((arg: { title: string; content: string }, i: number) => (
                    <div key={i} className="pl-4 border-l-2 border-primary">
                      <h3 className="font-medium">{arg.title}</h3>
                      <p className="font-reading text-sm leading-relaxed mt-1 whitespace-pre-wrap">{arg.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary italic">No arguments drafted yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold mb-3">Evidence</h2>
              {brief.evidence_summary && brief.evidence_summary.length > 0 ? (
                <div className="space-y-3">
                  {brief.evidence_summary.map((ev: { source: string; claim: string; relevance: string }, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-bg">
                      <p className="font-medium text-sm">{ev.source}</p>
                      <p className="text-sm text-text-secondary mt-1">{ev.claim}</p>
                      <p className="text-xs text-text-secondary mt-1">Relevance: {ev.relevance}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary italic">No evidence collected yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold mb-3">Preemptive Rebuttals</h2>
              {brief.preemptive_rebuttals ? (
                <p className="font-reading leading-relaxed whitespace-pre-wrap">{brief.preemptive_rebuttals}</p>
              ) : (
                <p className="text-text-secondary italic">Not yet drafted</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold mb-3">Closing Statement</h2>
              {brief.closing_statement ? (
                <p className="font-reading leading-relaxed whitespace-pre-wrap">{brief.closing_statement}</p>
              ) : (
                <p className="text-text-secondary italic">Not yet drafted</p>
              )}
            </CardContent>
          </Card>
        </div>

        {brief.status === 'draft' && (
          <div className="mt-8 text-center">
            <Link href={`/cases/${caseId}/counsel`}>
              <Button variant="primary" size="lg">
                Continue with counsel
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
