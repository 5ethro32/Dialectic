import Link from 'next/link';
import { SEED_DEBATES, JUDGE_META, getScore, getWinningSide } from '@/lib/seed-debates';
import type { SeedDebate } from '@/lib/seed-debates';

const CATEGORY_COLORS: Record<string, string> = {
  Sports: '#10B981',
  Technology: '#8B5CF6',
  Work: '#F59E0B',
  Society: '#EF4444',
  Finance: '#3B82F6',
};

function ScoreBar({ debate }: { debate: SeedDebate }) {
  const { a, b } = getScore(debate);
  const winner = getWinningSide(debate);
  const total = 5;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-semibold ${winner === 'A' ? 'text-primary' : 'text-text-secondary'}`}>
          {debate.sideA.label}
        </span>
        <span className="font-mono text-text-secondary">{a} – {b}</span>
        <span className={`font-semibold ${winner === 'B' ? 'text-primary' : 'text-text-secondary'}`}>
          {debate.sideB.label}
        </span>
      </div>
      <div className="flex gap-1 h-2">
        {Array.from({ length: total }).map((_, i) => {
          const isA = i < a;
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-all"
              style={{
                backgroundColor: isA ? 'var(--primary)' : 'var(--accent)',
                opacity: isA ? 0.9 : 0.7,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function JudgeDots({ debate }: { debate: SeedDebate }) {
  return (
    <div className="flex items-center gap-1.5">
      {debate.votes.map((vote) => {
        const meta = JUDGE_META[vote.judge];
        return (
          <div
            key={vote.judge}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
            style={{
              backgroundColor: `${meta.color}20`,
              border: `1.5px solid ${meta.color}`,
              color: meta.color,
            }}
            title={`${meta.name}: ${vote.side === 'A' ? debate.sideA.label : debate.sideB.label}`}
          >
            {vote.side}
          </div>
        );
      })}
    </div>
  );
}

function TrendingCard({ debate }: { debate: SeedDebate }) {
  const catColor = CATEGORY_COLORS[debate.category] || '#6B6B6B';
  const winner = getWinningSide(debate);

  return (
    <Link href={`/debates/${debate.slug}`} className="group block">
      <div className="relative bg-surface/70 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/30 hover:bg-surface/90 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col">
        {/* Category + time */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${catColor}15`, color: catColor }}
          >
            {debate.category}
          </span>
          <span className="text-xs text-text-secondary">
            {debate.daysAgo === 1 ? 'Yesterday' : `${debate.daysAgo}d ago`}
          </span>
        </div>

        {/* Topic */}
        <h3 className="font-display text-lg font-bold leading-snug mb-4 group-hover:text-primary transition-colors">
          {debate.topic}
        </h3>

        {/* Winner callout */}
        <p className="text-xs text-text-secondary mb-4">
          Verdict: <span className="font-semibold text-text-primary">{winner === 'A' ? debate.sideA.label : debate.sideB.label}</span> prevails
        </p>

        {/* Score bar */}
        <div className="mt-auto space-y-4">
          <ScoreBar debate={debate} />
          <div className="flex items-center justify-between">
            <JudgeDots debate={debate} />
            <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Read verdict &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RecentRow({ debate }: { debate: SeedDebate }) {
  const { a, b } = getScore(debate);
  const winner = getWinningSide(debate);
  const catColor = CATEGORY_COLORS[debate.category] || '#6B6B6B';

  return (
    <Link href={`/debates/${debate.slug}`} className="group block">
      <div className="flex items-center gap-4 py-4 px-5 rounded-xl hover:bg-surface/60 transition-all border border-transparent hover:border-border/50">
        {/* Score */}
        <div className="flex-shrink-0 w-14 text-center">
          <span className="font-mono text-lg font-bold text-text-primary">{a}–{b}</span>
        </div>

        {/* Topic + meta */}
        <div className="flex-1 min-w-0">
          <h4 className="font-display text-sm font-semibold truncate group-hover:text-primary transition-colors">
            {debate.topic}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span
              className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${catColor}15`, color: catColor }}
            >
              {debate.category}
            </span>
            <span className="text-xs text-text-secondary">
              {winner === 'A' ? debate.sideA.label : debate.sideB.label} prevails
            </span>
            <span className="text-xs text-text-secondary/50">&middot;</span>
            <span className="text-xs text-text-secondary/50">{debate.daysAgo}d ago</span>
          </div>
        </div>

        {/* Judge dots */}
        <div className="flex-shrink-0 hidden sm:block">
          <JudgeDots debate={debate} />
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 text-text-secondary/30 group-hover:text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function JudgeShape({ judgeKey, color, size = 40 }: { judgeKey: string; color: string; size?: number }) {
  const shapes: Record<string, React.ReactNode> = {
    empiricist: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <circle cx="24" cy="24" r="12" fill={`${color}25`} />
        <circle cx="24" cy="24" r="5" fill={color} />
      </svg>
    ),
    logician: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <rect x="3" y="3" width="42" height="42" rx="4" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <rect x="13" y="13" width="22" height="22" rx="2" fill={`${color}25`} />
        <rect x="20" y="20" width="8" height="8" fill={color} />
      </svg>
    ),
    contrarian: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <polygon points="24,3 45,44 3,44" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <polygon points="24,16 36,40 12,40" fill={`${color}25`} />
      </svg>
    ),
    pragmatist: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <polygon points="24,2 44,16 38,42 10,42 4,16" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <polygon points="24,12 36,22 32,38 16,38 12,22" fill={`${color}25`} />
      </svg>
    ),
    chief_justice: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <polygon points="24,6 30,18 44,20 34,30 36,44 24,38 12,44 14,30 4,20 18,18" fill={`${color}25`} />
        <circle cx="24" cy="24" r="5" fill={color} />
      </svg>
    ),
  };
  return <>{shapes[judgeKey] || shapes.chief_justice}</>;
}

export default function LandingPage() {
  const trending = SEED_DEBATES.filter(d => d.trending);
  const recent = SEED_DEBATES.filter(d => !d.trending);

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
        {/* Compact Hero */}
        <section className="relative py-16 sm:py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="hero-glow hero-glow-1" />
            <div className="hero-glow hero-glow-2" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[0.95] mb-5">
              See how AI judges settle<br />
              <span className="text-gradient">the big debates</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
              Five AI judges. Different analytical lenses. Transparent verdicts.
              Browse real debates or start your own.
            </p>
            <Link
              href="/signup"
              className="group inline-flex items-center bg-accent text-white px-7 py-3 rounded-xl text-base font-medium hover:bg-accent-light transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5"
            >
              Start your own debate
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </section>

        {/* Trending Debates */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Trending debates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {trending.map(debate => (
              <TrendingCard key={debate.slug} debate={debate} />
            ))}
          </div>
        </section>

        {/* Recent Verdicts */}
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">Recent verdicts</h2>
          <div className="bg-surface/40 backdrop-blur-sm border border-border/40 rounded-2xl divide-y divide-border/30 overflow-hidden">
            {recent.map(debate => (
              <RecentRow key={debate.slug} debate={debate} />
            ))}
          </div>
        </section>

        {/* How it works — compact */}
        <section className="border-t border-border/40 bg-surface/30">
          <div className="max-w-6xl mx-auto px-4 py-20">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-widest text-primary font-medium mb-3">How it works</p>
              <h2 className="font-display text-3xl font-bold">Your AI-powered debate platform</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  step: '01',
                  title: 'State your case',
                  desc: 'Pick a topic and choose your side. Your private AI counsel interviews you to build your argument.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Build your brief',
                  desc: 'Your counsel researches evidence and structures a legal-style brief. No writing skills required.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Face the panel',
                  desc: 'Five AI judges independently assess both briefs and deliver a transparent, reasoned verdict.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* The Panel — compact */}
            <div className="text-center mb-8">
              <h3 className="font-display text-xl font-bold mb-2">The Panel</h3>
              <p className="text-sm text-text-secondary">Five judges, five lenses, one transparent verdict</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {Object.entries(JUDGE_META).map(([key, meta]) => (
                <div key={key} className="flex flex-col items-center gap-2">
                  <JudgeShape judgeKey={key} color={meta.color} size={44} />
                  <div className="text-center">
                    <p className="text-xs font-semibold" style={{ color: meta.color }}>{meta.name}</p>
                    <p className="text-[10px] text-text-secondary">{meta.focus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="cta-glow" />
          </div>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              Disagree with a verdict?
            </h2>
            <p className="text-text-secondary mb-8 text-lg">
              Make your case. Let the panel decide.
            </p>
            <Link
              href="/signup"
              className="group inline-flex items-center bg-accent text-white px-8 py-3.5 rounded-xl text-lg font-medium hover:bg-accent-light transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5"
            >
              Start your first debate
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
