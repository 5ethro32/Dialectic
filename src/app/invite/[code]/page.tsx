'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { user } = useAuth();

  const [caseInfo, setCaseInfo] = useState<any>(null);
  const [positionLabel, setPositionLabel] = useState('');
  const [positionSide, setPositionSide] = useState('against');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInvite = async () => {
      try {
        const res = await fetch(`/api/invite/${code}`);
        if (res.ok) {
          setCaseInfo(await res.json());
        } else {
          setError('This invite link is invalid or has expired.');
        }
      } catch {
        setError('Failed to load invite.');
      }
      setLoading(false);
    };
    loadInvite();
  }, [code]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionLabel.trim()) {
      setError('Please state your position');
      return;
    }

    setJoining(true);
    setError('');

    try {
      const res = await fetch(`/api/invite/${code}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_label: positionLabel.trim(),
          position_side: positionSide,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/cases/${data.case_id}/counsel`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to join case');
      }
    } catch {
      setError('Failed to join case');
    }
    setJoining(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-text-secondary">Loading invite...</div>
        </div>
      </>
    );
  }

  if (error && !caseInfo) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-error mb-4">{error}</p>
            <Link href="/dashboard">
              <Button variant="secondary">Go to dashboard</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">You&apos;ve been invited to a debate</h1>
          <Card className="mb-6">
            <CardContent>
              <h2 className="font-display text-xl font-semibold mb-2">{caseInfo?.title}</h2>
              {caseInfo?.description && (
                <p className="text-sm text-text-secondary mb-3">{caseInfo.description}</p>
              )}
              <p className="text-sm text-text-secondary">
                Created by {caseInfo?.creator?.display_name}
              </p>
              <Badge className="mt-2">{caseInfo?.mode}</Badge>
            </CardContent>
          </Card>
          <p className="text-text-secondary mb-4">Sign in or create an account to join this debate.</p>
          <div className="flex gap-3 justify-center">
            <Link href={`/login?redirect=/invite/${code}`}>
              <Button>Sign in</Button>
            </Link>
            <Link href={`/signup?redirect=/invite/${code}`}>
              <Button variant="secondary">Create account</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="font-display text-2xl font-bold mb-6 text-center">Join the debate</h1>

        <Card className="mb-6">
          <CardContent>
            <h2 className="font-display text-xl font-semibold mb-2">{caseInfo?.title}</h2>
            {caseInfo?.description && (
              <p className="text-sm text-text-secondary mb-3">{caseInfo.description}</p>
            )}
            <p className="text-sm text-text-secondary">
              Created by {caseInfo?.creator?.display_name}
            </p>
            <Badge className="mt-2">{caseInfo?.mode}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                label="Your position"
                value={positionLabel}
                onChange={(e) => setPositionLabel(e.target.value)}
                placeholder="State your position on this topic"
                required
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Side</label>
                <div className="flex gap-2">
                  {[
                    { value: 'for', label: 'FOR' },
                    { value: 'against', label: 'AGAINST' },
                    { value: 'exploring', label: 'EXPLORING' },
                  ].map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setPositionSide(s.value)}
                      className={`px-4 py-2 rounded-lg border text-sm ${
                        positionSide === s.value
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border text-text-secondary'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <Button type="submit" loading={joining} className="w-full">
                Join debate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
