'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import type { Case } from '@/types';
import { generateInviteUrl, formatRelativeTime } from '@/lib/utils';

export default function CaseOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deliberating, setDeliberating] = useState(false);

  useEffect(() => {
    if (!user || authLoading) return;
    const loadCase = async () => {
      try {
        const res = await fetch(`/api/cases/${caseId}`);
        if (res.ok) setCaseData(await res.json());
      } catch (e) {
        console.error('Failed to load case:', e);
      }
      setLoading(false);
    };
    loadCase();
  }, [user, authLoading, caseId]);

  const handleCopyInvite = () => {
    if (!caseData?.invite_code) return;
    navigator.clipboard.writeText(generateInviteUrl(caseData.invite_code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerDeliberation = async () => {
    if (!confirm('This will send both briefs to the judicial panel. Continue?')) return;
    setDeliberating(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/deliberate`, { method: 'POST' });
      if (res.ok) {
        await res.json();
        router.push(`/cases/${caseId}/verdict`);
      } else {
        const data = await res.json();
        alert(data.error || 'Deliberation failed');
      }
    } catch {
      alert('Deliberation failed');
    }
    setDeliberating(false);
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-border rounded w-1/2" />
            <div className="h-32 bg-border rounded-card" />
          </div>
        </div>
      </>
    );
  }

  if (!caseData) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-text-secondary">Case not found.</p>
        </div>
      </>
    );
  }

  const isCreator = user?.id === caseData.created_by;
  const userPosition = caseData.positions?.find(p => p.user_id === user?.id);
  const opponentPosition = caseData.positions?.find(p => p.user_id !== user?.id);
  const inviteUrl = caseData.invite_code ? generateInviteUrl(caseData.invite_code) : '';

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard" className="text-text-secondary hover:text-text-primary text-sm">
            &larr; Dashboard
          </Link>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold">{caseData.title}</h1>
            {caseData.description && (
              <p className="text-text-secondary mt-2">{caseData.description}</p>
            )}
          </div>
          <Badge variant={caseData.status === 'verdict' ? 'success' : 'primary'} className="text-sm">
            {caseData.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Creator */}
          <Card>
            <CardContent>
              <p className="text-xs text-text-secondary mb-1">Creator</p>
              <p className="font-medium">{caseData.creator?.display_name}</p>
              {userPosition && isCreator && (
                <p className="text-sm text-text-secondary mt-1">
                  {userPosition.label} ({userPosition.side})
                </p>
              )}
              {!isCreator && caseData.positions?.find(p => p.user_id === caseData.created_by) && (
                <p className="text-sm text-text-secondary mt-1">
                  {caseData.positions.find(p => p.user_id === caseData.created_by)?.label}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Opponent */}
          <Card>
            <CardContent>
              <p className="text-xs text-text-secondary mb-1">Opponent</p>
              {caseData.opponent ? (
                <>
                  <p className="font-medium">{caseData.opponent.display_name}</p>
                  {opponentPosition && (
                    <p className="text-sm text-text-secondary mt-1">
                      {opponentPosition.label} ({opponentPosition.side})
                    </p>
                  )}
                </>
              ) : (
                <p className="text-text-secondary text-sm">Waiting for opponent to join</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invite link (only for draft cases without opponent) */}
        {caseData.status === 'draft' && !caseData.opponent_id && (
          <Card className="mb-8">
            <CardContent>
              <h3 className="font-display text-lg font-semibold mb-3">Invite your opponent</h3>
              <p className="text-sm text-text-secondary mb-3">
                Share this link with someone to invite them to the other side of this debate.
              </p>
              <div className="flex gap-2">
                <Input
                  value={inviteUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyInvite} variant="secondary">
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {['consulting', 'draft'].includes(caseData.status) && caseData.opponent_id && (
            <Link href={`/cases/${caseId}/counsel`} className="block">
              <Button variant="primary" size="lg" className="w-full">
                Enter counsel room
              </Button>
            </Link>
          )}

          {caseData.status === 'draft' && !caseData.opponent_id && isCreator && (
            <Link href={`/cases/${caseId}/counsel`} className="block">
              <Button variant="secondary" size="lg" className="w-full">
                Start preparing with your counsel
              </Button>
            </Link>
          )}

          <Link href={`/cases/${caseId}/brief`} className="block">
            <Button variant="secondary" className="w-full">
              View brief
            </Button>
          </Link>

          {caseData.status === 'submitted' && (
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={handleTriggerDeliberation}
              loading={deliberating}
            >
              Send to judicial panel
            </Button>
          )}

          {caseData.status === 'verdict' && (
            <Link href={`/cases/${caseId}/verdict`} className="block">
              <Button variant="accent" size="lg" className="w-full">
                View verdict
              </Button>
            </Link>
          )}

          {caseData.status === 'deliberating' && (
            <div className="text-center py-6 text-text-secondary">
              <div className="animate-pulse">The panel is deliberating...</div>
            </div>
          )}
        </div>

        <p className="text-xs text-text-secondary text-center mt-8">
          Mode: {caseData.mode} &middot; Created {formatRelativeTime(caseData.created_at)}
        </p>
      </div>
    </>
  );
}
