'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useThemeContext } from '@/components/layout/ThemeProvider';

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refetchProfile } = useAuth();
  const { theme, setTheme } = useThemeContext();
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-border rounded w-1/3" />
            <div className="h-32 bg-border rounded" />
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    const updates: Record<string, any> = {
      display_name: displayName,
      theme_preference: theme,
    };

    if (apiKey) {
      updates.encrypted_api_key = apiKey;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      setMessage('Failed to save: ' + error.message);
    } else {
      setMessage('Profile updated successfully');
      refetchProfile();
    }
    setSaving(false);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold mb-8">Profile</h1>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold mb-4">Account</h2>
              <div className="space-y-4">
                <Input
                  label="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                  <p className="text-text-secondary text-sm">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold mb-4">Appearance</h2>
              <div className="flex gap-3">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-4 py-2 rounded-lg border text-sm capitalize ${
                      theme === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text-secondary hover:border-primary/50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold mb-2">Advanced</h2>
              <p className="text-sm text-text-secondary mb-4">
                Use your own Anthropic API key (optional). If empty, Dialectic&apos;s built-in AI is used.
              </p>
              <Input
                label="Anthropic API key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                hint={profile?.encrypted_api_key ? 'Using your API key' : "Using Dialectic's AI"}
              />
            </CardContent>
          </Card>

          {message && (
            <p className={`text-sm ${message.includes('Failed') ? 'text-error' : 'text-success'}`}>
              {message}
            </p>
          )}

          <Button onClick={handleSave} loading={saving}>
            Save changes
          </Button>
        </div>
      </div>
    </>
  );
}
