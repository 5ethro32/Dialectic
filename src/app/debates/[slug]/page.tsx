import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SEED_DEBATES, JUDGE_META, getScore, getWinningSide } from '@/lib/seed-debates';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function JudgeShape({ judgeKey, color, size = 48 }: { judgeKey: string; color: string; size?: number }) {
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

export default async function DebatePage({ params }: PageProps) {
  const { slug } = await params;
  const debate = SEED_DEBATES.find(d => d.slug === slug);

  if (!debate) {
    notFound();
  }

  const { a, b } = getScore(debate);
  const winner = getWinningSide(debate);
  const winnerLabel = winner === 'A' ? debate.sideA.label : debate.sideB.label;

  return (
    <>
      {/* Nav */}
      <nav className="border-b border-border/50 bg-bg/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-display text-2xl font-bold text-primary">
                Dialectic
              </Link>
              <span className="text-border">/</span>
              <Link href="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                All debates
              </Link>
            </div>
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

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
            {debate.category}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
            {debate.topic}
          </h1>

          {/* Score */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-4">
            <div className={`text-center ${winner === 'A' ? '' : 'opacity-60'}`}>
              <p className="font-display text-4xl sm:text-5xl font-bold text-primary">{a}</p>
              <p className="text-sm font-semibold mt-1">{debate.sideA.label}</p>
            </div>
            <span className="text-3xl text-text-secondary/30 font-light">vs</span>
            <div className={`text-center ${winner === 'B' ? '' : 'opacity-60'}`}>
              <p className="font-display text-4xl sm:text-5xl font-bold text-accent">{b}</p>
              <p className="text-sm font-semibold mt-1">{debate.sideB.label}</p>
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">{winnerLabel}</span> prevails by {Math.abs(a - b) === 1 ? 'a narrow margin' : 'a clear margin'}
          </p>
        </div>

        {/* Briefs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className={`bg-surface/70 backdrop-blur-sm border rounded-2xl p-6 ${winner === 'A' ? 'border-primary/30' : 'border-border/50'}`}>
            <div className="flex items-center gap-2 mb-4">
              {winner === 'A' && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Winner
                </span>
              )}
              <h3 className="font-display text-lg font-bold">{debate.sideA.label}</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed font-reading">{debate.sideA.brief}</p>
          </div>
          <div className={`bg-surface/70 backdrop-blur-sm border rounded-2xl p-6 ${winner === 'B' ? 'border-accent/30' : 'border-border/50'}`}>
            <div className="flex items-center gap-2 mb-4">
              {winner === 'B' && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                  Winner
                </span>
              )}
              <h3 className="font-display text-lg font-bold">{debate.sideB.label}</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed font-reading">{debate.sideB.brief}</p>
          </div>
        </div>

        {/* Judge Verdicts */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold text-center mb-2">The Panel&apos;s Verdict</h2>
          <p className="text-sm text-text-secondary text-center mb-10">Each judge evaluates independently through their analytical lens</p>

          <div className="space-y-4">
            {debate.votes.map((vote) => {
              const meta = JUDGE_META[vote.judge];
              const votedFor = vote.side === 'A' ? debate.sideA.label : debate.sideB.label;
              const isChief = vote.judge === 'chief_justice';

              return (
                <div
                  key={vote.judge}
                  className={`bg-surface/70 backdrop-blur-sm border rounded-2xl p-6 transition-all ${
                    isChief ? 'border-[#1B6B6D]/30 bg-surface/80' : 'border-border/50'
                  }`}
                >
                  <div className="flex items-start gap-4 sm:gap-5">
                    {/* Judge avatar */}
                    <div className="flex-shrink-0 pt-1">
                      <JudgeShape judgeKey={vote.judge} color={meta.color} size={isChief ? 56 : 44} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-display text-base font-bold" style={{ color: meta.color }}>
                          {meta.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-text-secondary">{meta.focus}</span>
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ml-auto"
                          style={{
                            backgroundColor: `${vote.side === 'A' ? 'var(--primary)' : 'var(--accent)'}15`,
                            color: vote.side === 'A' ? 'var(--primary)' : 'var(--accent)',
                          }}
                        >
                          {votedFor}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed font-reading">
                        {vote.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verdict Summary */}
        <div className="bg-surface/50 border border-primary/20 rounded-2xl p-8 mb-16 text-center">
          <h3 className="font-display text-lg font-bold text-primary mb-3">Final Verdict</h3>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl mx-auto font-reading">
            {debate.verdictSummary}
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pb-8">
          <h3 className="font-display text-2xl font-bold mb-3">Disagree?</h3>
          <p className="text-text-secondary mb-6">Start your own debate and let the panel decide.</p>
          <Link
            href="/signup"
            className="group inline-flex items-center bg-accent text-white px-8 py-3 rounded-xl text-base font-medium hover:bg-accent-light transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5"
          >
            Make your case
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg font-bold text-primary">Dialectic</Link>
          <p className="text-sm text-text-secondary">Structured debate for clear thinking</p>
        </div>
      </footer>
    </>
  );
}
