import Link from 'next/link';

const judges = [
  {
    name: 'The Empiricist',
    focus: 'Evidence & Data',
    color: '#3B82F6',
    key: 'empiricist',
    desc: 'Demands verifiable facts and measurable outcomes',
  },
  {
    name: 'The Logician',
    focus: 'Logic & Structure',
    color: '#8B5CF6',
    key: 'logician',
    desc: 'Tests internal consistency and reasoning chains',
  },
  {
    name: 'The Contrarian',
    focus: 'Robustness',
    color: '#EF4444',
    key: 'contrarian',
    desc: 'Attacks weak points and exposes assumptions',
  },
  {
    name: 'The Pragmatist',
    focus: 'Practicality',
    color: '#F59E0B',
    key: 'pragmatist',
    desc: 'Evaluates real-world applicability and trade-offs',
  },
  {
    name: 'Chief Justice',
    focus: 'Synthesis',
    color: '#1B6B6D',
    key: 'chief_justice',
    desc: 'Weighs all perspectives and delivers the final verdict',
  },
];

function JudgeShape({ judgeKey, color, size = 56 }: { judgeKey: string; color: string; size?: number }) {
  const shapes: Record<string, React.ReactNode> = {
    empiricist: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <circle cx="24" cy="24" r="14" fill={`${color}25`} />
        <circle cx="24" cy="24" r="7" fill={`${color}60`} />
        <circle cx="24" cy="24" r="3" fill={color} />
      </svg>
    ),
    logician: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <rect x="3" y="3" width="42" height="42" rx="4" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <rect x="11" y="11" width="26" height="26" rx="2" fill={`${color}25`} />
        <rect x="18" y="18" width="12" height="12" rx="1" fill={`${color}60`} />
        <rect x="22" y="22" width="4" height="4" fill={color} />
      </svg>
    ),
    contrarian: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <polygon points="24,3 45,44 3,44" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <polygon points="24,14 37,40 11,40" fill={`${color}25`} />
        <polygon points="24,23 31,37 17,37" fill={`${color}60`} />
      </svg>
    ),
    pragmatist: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <polygon points="24,2 44,16 38,42 10,42 4,16" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <polygon points="24,10 37,20 33,38 15,38 11,20" fill={`${color}25`} />
        <circle cx="24" cy="26" r="6" fill={`${color}60`} />
      </svg>
    ),
    chief_justice: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <polygon points="24,6 30,18 44,20 34,30 36,44 24,38 12,44 14,30 4,20 18,18" fill={`${color}30`} />
        <circle cx="24" cy="24" r="7" fill={`${color}60`} />
        <circle cx="24" cy="24" r="3" fill={color} />
      </svg>
    ),
  };
  return <>{shapes[judgeKey] || shapes.chief_justice}</>;
}

export default function LandingPage() {
  return (
    <>
      {/* Nav */}
      <nav className="border-b border-border/50 bg-bg/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-primary">Dialectic</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="overflow-hidden">
        {/* Hero */}
        <section className="relative min-h-[85vh] flex items-center justify-center">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="hero-glow hero-glow-1" />
            <div className="hero-glow hero-glow-2" />
            <div className="hero-glow hero-glow-3" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">AI-powered structured debate</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.95] mb-8 animate-fade-in-up">
              Debate with<br />
              <span className="text-gradient">clarity</span>, not chaos
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-100">
              Your AI counsel builds your case. Five judges with different analytical lenses decide who argued better. Everything is transparent.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-200">
              <Link
                href="/signup"
                className="group relative bg-accent text-white px-8 py-3.5 rounded-xl text-lg font-medium hover:bg-accent-light transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5"
              >
                Start debating
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
              <Link
                href="/login"
                className="border border-border/60 px-8 py-3.5 rounded-xl text-lg font-medium text-text-secondary hover:text-text-primary hover:border-text-secondary/30 hover:bg-surface/50 transition-all"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="relative max-w-5xl mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-3">How it works</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Three steps to a reasoned verdict</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: '01',
                title: 'State your case',
                desc: 'Pick a topic and choose your side. Your private AI counsel interviews you to understand what you truly believe.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Build your brief',
                desc: 'Your counsel researches evidence, structures arguments, and compiles a legal-style brief. You never need to be a great writer.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Face the panel',
                desc: 'Five AI judges independently assess both briefs with different analytical lenses and deliver a transparent, reasoned verdict.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="group relative bg-surface/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/30 hover:bg-surface/80 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Connector line on desktop */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 border-t border-dashed border-border/60" />
                )}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-mono text-text-secondary/50 uppercase tracking-wider">{item.step}</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The Panel */}
        <section className="relative py-24">
          <div className="absolute inset-0 bg-surface/40" />
          <div className="relative max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-widest text-primary font-medium mb-3">The panel</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Five lenses. One verdict.</h2>
              <p className="text-text-secondary max-w-lg mx-auto">
                Each judge evaluates independently, ensuring no single perspective dominates. The Chief Justice synthesizes everything into a final ruling.
              </p>
            </div>

            {/* Chief Justice featured */}
            <div className="mb-8">
              <div
                className="group relative mx-auto max-w-md bg-surface/70 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:border-[#1B6B6D]/40 transition-all hover:shadow-xl hover:shadow-[#1B6B6D]/5"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#1B6B6D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex justify-center mb-4 judge-float">
                    <JudgeShape judgeKey="chief_justice" color="#1B6B6D" size={72} />
                  </div>
                  <p className="font-display text-lg font-bold" style={{ color: '#1B6B6D' }}>Chief Justice</p>
                  <p className="text-xs uppercase tracking-wider text-text-secondary mt-1 mb-3">Synthesis</p>
                  <p className="text-sm text-text-secondary leading-relaxed">Weighs all perspectives and delivers the final verdict</p>
                </div>
              </div>
            </div>

            {/* Other 4 judges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {judges.filter(j => j.key !== 'chief_justice').map((judge, i) => (
                <div
                  key={judge.key}
                  className="group relative bg-surface/70 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center hover:border-opacity-60 transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ '--judge-color': judge.color } as React.CSSProperties}
                >
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `linear-gradient(to bottom, ${judge.color}08, transparent)` }}
                  />
                  <div className="relative">
                    <div className={`flex justify-center mb-4 judge-float animation-delay-${(i + 1) * 100}`}>
                      <JudgeShape judgeKey={judge.key} color={judge.color} size={56} />
                    </div>
                    <p className="font-display text-sm font-bold" style={{ color: judge.color }}>
                      {judge.name}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-text-secondary mt-1 mb-2">{judge.focus}</p>
                    <p className="text-xs text-text-secondary/80 leading-relaxed hidden sm:block">{judge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof / stats placeholder */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-display text-4xl font-bold text-primary">5</p>
              <p className="text-sm text-text-secondary mt-1">Independent judges</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold text-primary">100%</p>
              <p className="text-sm text-text-secondary mt-1">Transparent reasoning</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold text-primary">0</p>
              <p className="text-sm text-text-secondary mt-1">Hidden biases</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="cta-glow" />
          </div>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-6 leading-tight">
              Ready to argue<br />your case?
            </h2>
            <p className="text-text-secondary mb-10 text-lg">
              Free to start. Bring your ideas &mdash; your counsel handles the rest.
            </p>
            <Link
              href="/signup"
              className="group inline-flex items-center bg-accent text-white px-10 py-4 rounded-xl text-lg font-medium hover:bg-accent-light transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5"
            >
              Get started free
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-10">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-display text-lg font-bold text-primary">Dialectic</span>
            <p className="text-sm text-text-secondary">Structured debate for clear thinking</p>
          </div>
        </footer>
      </main>
    </>
  );
}
