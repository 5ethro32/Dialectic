'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { formatDate } from '@/lib/utils';
import type { JournalNote } from '@/types';

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading) return;
    const loadData = async () => {
      try {
        const res = await fetch('/api/journal');
        if (res.ok) {
          const data = await res.json();
          setCases(data.cases || []);
          setNotes(data.notes || []);
        }
      } catch (e) {
        console.error('Failed to load journal:', e);
      }
      setLoading(false);
    };
    loadData();
  }, [user, authLoading]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: selectedCaseId || null,
          content: newNote.trim(),
        }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes(prev => [note, ...prev]);
        setNewNote('');
      }
    } catch (e) {
      console.error('Failed to save note:', e);
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-border rounded w-1/4" />
            <div className="h-32 bg-border rounded-card" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">Journal</h1>

        {/* Add reflection */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="font-display text-lg font-semibold mb-3">Add a reflection</h2>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="What did you learn from your recent debates? What would you do differently?"
              rows={3}
            />
            <div className="flex items-center gap-3 mt-3">
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary"
              >
                <option value="">General reflection</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <Button onClick={handleAddNote} loading={saving} disabled={!newNote.trim()}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="space-y-4">
          {/* Interleave cases and notes chronologically */}
          {[...cases.map(c => ({ ...c, _type: 'case' as const, _date: c.created_at })),
            ...notes.map(n => ({ ...n, _type: 'note' as const, _date: n.created_at }))]
            .sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime())
            .map((item) => {
              if (item._type === 'note') {
                const note = item as JournalNote & { _type: 'note'; _date: string };
                const linkedCase = cases.find(c => c.id === note.case_id);
                return (
                  <Card key={`note-${note.id}`}>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>Reflection</Badge>
                        <span className="text-xs text-text-secondary">{formatDate(note.created_at)}</span>
                        {linkedCase && (
                          <Link href={`/cases/${linkedCase.id}`} className="text-xs text-primary hover:underline">
                            {linkedCase.title}
                          </Link>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    </CardContent>
                  </Card>
                );
              } else {
                const c = item as any;
                return (
                  <Card key={`case-${c.id}`}>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={c.status === 'verdict' ? 'success' : 'primary'}>
                            {c.status}
                          </Badge>
                          <span className="text-xs text-text-secondary">{formatDate(c.created_at)}</span>
                        </div>
                      </div>
                      <Link href={c.status === 'verdict' ? `/cases/${c.id}/verdict` : `/cases/${c.id}`}>
                        <h3 className="font-display text-lg font-semibold hover:text-primary">{c.title}</h3>
                      </Link>
                      <p className="text-sm text-text-secondary mt-1">
                        {c.creator?.display_name} vs {c.opponent?.display_name || 'TBD'}
                      </p>
                    </CardContent>
                  </Card>
                );
              }
            })
          }

          {cases.length === 0 && notes.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-text-secondary">Your journal is empty. Start a case to begin building your debate history.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
