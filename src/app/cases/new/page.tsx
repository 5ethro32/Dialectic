'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';

export default function NewCasePage() {
  const { loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState('adversarial');
  const [positionLabel, setPositionLabel] = useState('');
  const [positionSide, setPositionSide] = useState('for');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !positionLabel.trim()) {
      setError('Title and position are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          mode,
          position_label: positionLabel.trim(),
          position_side: positionSide,
        }),
      });

      if (res.ok) {
        const caseData = await res.json();
        router.push(`/cases/${caseData.id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create case');
      }
    } catch {
      setError('Failed to create case');
    }
    setSaving(false);
  };

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold mb-8">Create a new case</h1>

        <Card>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-6">
              <Input
                label="Case title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., AI will cause mass unemployment within 10 years"
                required
              />

              <Textarea
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context or scope for the debate..."
                rows={3}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'adversarial', label: 'Adversarial', desc: 'Classic debate with a winner' },
                    { value: 'inquiry', label: 'Inquiry', desc: 'Exploratory, no fixed sides' },
                    { value: 'challenge', label: 'Challenge', desc: 'One claims, one stress-tests' },
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMode(m.value)}
                      className={`p-3 rounded-lg border text-left ${
                        mode === m.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-xs text-text-secondary mt-1">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Your position"
                  value={positionLabel}
                  onChange={(e) => setPositionLabel(e.target.value)}
                  placeholder="e.g., AI will create more jobs than it destroys"
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
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <Button type="submit" loading={saving} size="lg" className="w-full">
                Create case
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
