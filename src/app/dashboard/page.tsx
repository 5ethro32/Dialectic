'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Case } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading) return;
    const loadCases = async () => {
      try {
        const res = await fetch('/api/cases');
        if (res.ok) setCases(await res.json());
      } catch (e) {
        console.error('Failed to load cases:', e);
      }
      setLoading(false);
    };
    loadCases();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-border rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-border rounded-card" />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  const activeCases = cases.filter(c => ['draft', 'consulting', 'submitted', 'deliberating'].includes(c.status));
  const verdictCases = cases.filter(c => c.status === 'verdict');
  const awaitingCases = activeCases.filter(c => c.status === 'submitted');

  // Build score trend data from verdict cases
  const scoreTrendData = verdictCases
    .slice(0, 10)
    .reverse()
    .map((c, i) => ({
      case: i + 1,
      score: (c as any).briefs?.[0]?.confidence_score || 5,
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'consulting': return 'primary';
      case 'submitted': return 'accent';
      case 'deliberating': return 'accent';
      case 'verdict': return 'success';
      default: return 'default';
    }
  };

  const getOpponentName = (c: Case) => {
    if (c.created_by === user?.id) return c.opponent?.display_name || 'Awaiting opponent';
    return c.creator?.display_name || 'Unknown';
  };

  const getUserPosition = (c: Case) => {
    return c.positions?.find(p => p.user_id === user?.id);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="text-text-secondary mt-1">Welcome back, {profile?.display_name}</p>
          </div>
          <Link href="/cases/new">
            <Button variant="accent" size="lg">+ New Case</Button>
          </Link>
        </div>

        {/* Awaiting action */}
        {awaitingCases.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4 text-accent">Awaiting Your Action</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {awaitingCases.map(c => (
                <Link key={c.id} href={`/cases/${c.id}`}>
                  <Card hover className="border-accent/30">
                    <CardContent>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                          <p className="text-sm text-text-secondary mt-1">vs {getOpponentName(c)}</p>
                        </div>
                        <Badge variant="accent">Action needed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Active cases */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-semibold mb-4">Active Cases</h2>
          {activeCases.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-text-secondary mb-4">No active cases yet.</p>
                <Link href="/cases/new">
                  <Button variant="primary">Create your first case</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCases.map(c => {
                const pos = getUserPosition(c);
                return (
                  <Link key={c.id} href={`/cases/${c.id}`}>
                    <Card hover>
                      <CardContent>
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant={getStatusColor(c.status) as any}>{c.status}</Badge>
                          <span className="text-xs text-text-secondary">{formatRelativeTime(c.updated_at)}</span>
                        </div>
                        <h3 className="font-display text-lg font-semibold mb-1">{c.title}</h3>
                        <p className="text-sm text-text-secondary">
                          vs {getOpponentName(c)}
                        </p>
                        {pos && (
                          <p className="text-xs text-text-secondary mt-2">
                            Your position: {pos.label} ({pos.side})
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Past verdicts */}
        {verdictCases.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">Past Verdicts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {verdictCases.map(c => (
                <Link key={c.id} href={`/cases/${c.id}/verdict`}>
                  <Card hover>
                    <CardContent>
                      <Badge variant="success" className="mb-2">Verdict</Badge>
                      <h3 className="font-display text-lg font-semibold mb-1">{c.title}</h3>
                      <p className="text-sm text-text-secondary">
                        vs {getOpponentName(c)}
                      </p>
                      <p className="text-xs text-text-secondary mt-2">
                        {formatRelativeTime(c.updated_at)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Score trend */}
        {scoreTrendData.length >= 2 && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">Score Trend</h2>
            <Card>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreTrendData}>
                      <XAxis dataKey="case" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--primary)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
