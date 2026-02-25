'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useThemeContext } from './ThemeProvider';

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useThemeContext();

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  return (
    <nav className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-primary">Dialectic</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg hover:bg-bg text-text-secondary hover:text-text-primary"
              title={`Theme: ${theme}`}
            >
              {resolvedTheme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              )}
            </button>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary">
                      Dashboard
                    </Link>
                    <Link href="/journal" className="text-sm text-text-secondary hover:text-text-primary">
                      Journal
                    </Link>
                    <Link href="/profile" className="text-sm text-text-secondary hover:text-text-primary">
                      {profile?.display_name || 'Profile'}
                    </Link>
                    <button
                      onClick={signOut}
                      className="text-sm text-text-secondary hover:text-error"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary">
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light"
                    >
                      Get started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
