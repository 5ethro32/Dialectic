import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      {/* Simple nav for landing page (no auth check) */}
      <nav className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-primary">Dialectic</span>
            </Link>
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
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            Debate with<br />
            <span className="text-primary">clarity</span>, not chaos
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8 font-body">
            Have a debate. Your AI counsel builds your case.
            Five judges decide who argued better.
            Everything is transparent.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-accent text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-accent-light transition-colors"
            >
              Start debating
            </Link>
            <Link
              href="/login"
              className="border border-border px-8 py-3 rounded-lg text-lg font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="font-display text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">State your case</h3>
              <p className="text-text-secondary text-sm">
                Pick a topic. Choose your side. Your private AI counsel interviews you
                to understand what you truly believe.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="font-display text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Build your brief</h3>
              <p className="text-text-secondary text-sm">
                Your counsel researches evidence, structures your arguments, and compiles
                a legal-style brief. You never need to be a great writer.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="font-display text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Face the panel</h3>
              <p className="text-text-secondary text-sm">
                Five AI judges &mdash; each with a different analytical lens &mdash; independently
                assess both briefs and deliver a transparent, reasoned verdict.
              </p>
            </div>
          </div>
        </section>

        {/* The Judges */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl font-bold text-center mb-12">The Panel</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'The Empiricist', focus: 'Evidence', color: '#3B82F6' },
              { name: 'The Logician', focus: 'Logic', color: '#8B5CF6' },
              { name: 'The Contrarian', focus: 'Robustness', color: '#EF4444' },
              { name: 'The Pragmatist', focus: 'Practicality', color: '#F59E0B' },
              { name: 'Chief Justice', focus: 'Synthesis', color: '#1B6B6D' },
            ].map(judge => (
              <div key={judge.name} className="text-center p-4 rounded-card bg-surface border border-border">
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-3"
                  style={{ backgroundColor: `${judge.color}20`, border: `2px solid ${judge.color}` }}
                />
                <p className="font-display text-sm font-semibold" style={{ color: judge.color }}>{judge.name}</p>
                <p className="text-xs text-text-secondary mt-1">{judge.focus}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to argue your case?</h2>
          <p className="text-text-secondary mb-8">Free to start. Bring your own AI key or use ours.</p>
          <Link
            href="/signup"
            className="bg-accent text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-accent-light transition-colors"
          >
            Get started
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-center text-sm text-text-secondary">
          <p>Dialectic &mdash; Structured debate for clear thinking</p>
        </footer>
      </main>
    </>
  );
}
