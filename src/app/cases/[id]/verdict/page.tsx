'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { JudgeAvatar } from '@/components/ui/JudgeAvatar';
import { JUDGE_CONFIG, type JudgeKey, type Verdict, type JudgeOpinion, type Case } from '@/types';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer,
} from 'recharts';

type RevealStage = 'announcement' | 'votes' | 'opinion' | 'judges' | 'scores' | 'recommendations' | 'synthesis';

export default function VerdictPage() {
  const params = useParams();
  const caseId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [opinions, setOpinions] = useState<JudgeOpinion[]>([]);
  const [, setBriefs] = useState<any[]>([]);
  const [stage, setStage] = useState<RevealStage>('announcement');
  const [revealedJudges, setRevealedJudges] = useState<number>(0);
  const [expandedJudge, setExpandedJudge] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading) return;

    const loadData = async () => {
      try {
        const [caseRes, verdictRes] = await Promise.all([
          fetch(`/api/cases/${caseId}`),
          fetch(`/api/cases/${caseId}/verdict`),
        ]);

        if (caseRes.ok) setCaseData(await caseRes.json());
        if (verdictRes.ok) {
          const data = await verdictRes.json();
          setVerdict(data.verdict);
          setOpinions(data.opinions);
          setBriefs(data.briefs);
        }
      } catch (error) {
        console.error('Failed to load verdict:', error);
      }
      setLoading(false);
    };

    loadData();
  }, [user, authLoading, caseId]);

  const handleReveal = () => {
    setStage('votes');
    // Animate judge reveals
    const specialistOpinions = opinions.filter(o => o.judge_key !== 'chief_justice');
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedJudges(count);
      if (count >= specialistOpinions.length) {
        clearInterval(interval);
        // After all votes revealed, move to opinion
        setTimeout(() => setStage('opinion'), 800);
      }
    }, 600);
  };

  const advanceStage = (next: RevealStage) => {
    setStage(next);
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-text-secondary">Loading verdict...</div>
        </div>
      </>
    );
  }

  if (!verdict || !caseData) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-text-secondary">No verdict found for this case.</p>
        </div>
      </>
    );
  }

  const creatorPosition = caseData.positions?.find(p => p.user_id === caseData.created_by);
  const opponentPosition = caseData.positions?.find(p => p.user_id === caseData.opponent_id);
  const specialistOpinions = opinions.filter(o => o.judge_key !== 'chief_justice');
  const chiefOpinion = opinions.find(o => o.judge_key === 'chief_justice');

  // Determine if current user is participant A or B
  const isCreator = user?.id === caseData.created_by;
  const userRecommendations = verdict.recommendations
    ? isCreator
      ? (verdict.recommendations as any).participant_a
      : (verdict.recommendations as any).participant_b
    : null;

  // Build radar chart data
  const buildRadarData = () => {
    const categories = ['Evidence', 'Logic', 'Robustness', 'Practicality', 'Overall'];
    const scoreA = specialistOpinions.map(o => o.score_participant_a?.overall || 5);
    const scoreB = specialistOpinions.map(o => o.score_participant_b?.overall || 5);

    // Add chief justice overall
    scoreA.push(chiefOpinion?.score_participant_a?.overall || 5);
    scoreB.push(chiefOpinion?.score_participant_b?.overall || 5);

    return categories.map((cat, i) => ({
      category: cat,
      [caseData.creator?.display_name || 'Participant A']: scoreA[i] || 5,
      [caseData.opponent?.display_name || 'Participant B']: scoreB[i] || 5,
    }));
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stage: Announcement */}
        {stage === 'announcement' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <p className="text-text-secondary text-sm uppercase tracking-widest mb-4">The panel has reached</p>
            <h1 className="font-display text-5xl font-bold mb-6">A Verdict</h1>
            <p className="font-display text-xl text-text-secondary mb-2">&ldquo;{caseData.title}&rdquo;</p>
            <div className="flex items-center gap-4 mt-4 mb-12 text-text-secondary">
              <span>{caseData.creator?.display_name} ({creatorPosition?.side?.toUpperCase()})</span>
              <span className="font-display text-lg">vs</span>
              <span>{caseData.opponent?.display_name} ({opponentPosition?.side?.toUpperCase()})</span>
            </div>
            <Button variant="accent" size="lg" onClick={handleReveal}>
              Reveal Verdict →
            </Button>
          </div>
        )}

        {/* Stage: Votes */}
        {stage !== 'announcement' && (
          <div className="space-y-8">
            {/* Vote summary */}
            <div className="text-center py-8">
              <p className="text-text-secondary text-sm uppercase tracking-widest mb-2">The panel ruled</p>
              <p className="font-display text-4xl font-bold mb-2">{verdict.winning_margin}</p>
              {verdict.winning_side !== 'split' && (
                <p className="font-display text-xl text-text-secondary">
                  in favour of the position <Badge variant="accent">{verdict.winning_side?.toUpperCase()}</Badge>
                </p>
              )}
              {verdict.winning_side === 'split' && (
                <p className="font-display text-xl text-text-secondary">Split decision</p>
              )}
            </div>

            {/* Judge votes */}
            <div className="space-y-3">
              {specialistOpinions.map((opinion, i) => {
                const config = JUDGE_CONFIG[opinion.judge_key as JudgeKey];
                const revealed = i < revealedJudges;
                return (
                  <div
                    key={opinion.id}
                    className={`flex items-center gap-4 p-4 rounded-card border transition-all duration-500 ${
                      revealed ? 'opacity-100 border-border' : 'opacity-0 border-transparent'
                    }`}
                    style={revealed ? { borderLeftColor: config?.color, borderLeftWidth: '4px' } : {}}
                  >
                    <JudgeAvatar judgeKey={opinion.judge_key} color={config?.color || '#888'} size={40} />
                    <div className="flex-1">
                      <p className="font-medium">{opinion.judge_display_name}</p>
                      <p className="text-sm text-text-secondary">{opinion.judge_title}</p>
                    </div>
                    <Badge variant="judge" color={config?.color}>
                      {opinion.verdict_for?.toUpperCase()}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Chief Justice summary */}
            {(stage === 'opinion' || stage === 'judges' || stage === 'scores' || stage === 'recommendations' || stage === 'synthesis') && (
              <Card className="mt-8">
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <JudgeAvatar judgeKey="chief_justice" color={JUDGE_CONFIG.chief_justice.color} size={48} />
                    <div>
                      <h2 className="font-display text-xl font-semibold">The Chief Justice</h2>
                      <p className="text-sm text-text-secondary">Majority Opinion</p>
                    </div>
                  </div>
                  <div className="font-reading text-base leading-relaxed whitespace-pre-wrap">
                    {verdict.majority_summary}
                  </div>
                  {stage === 'opinion' && (
                    <div className="mt-6 text-center">
                      <Button variant="secondary" onClick={() => advanceStage('judges')}>
                        View Individual Judges →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Individual judge cards */}
            {(stage === 'judges' || stage === 'scores' || stage === 'recommendations' || stage === 'synthesis') && (
              <div className="space-y-4 mt-8">
                <h2 className="font-display text-2xl font-semibold">Individual Opinions</h2>
                {specialistOpinions.map(opinion => {
                  const config = JUDGE_CONFIG[opinion.judge_key as JudgeKey];
                  const isExpanded = expandedJudge === opinion.judge_key;
                  return (
                    <Card key={opinion.id} className="overflow-hidden">
                      <div
                        className="p-4 cursor-pointer flex items-center gap-3"
                        style={{ borderLeft: `4px solid ${config?.color}` }}
                        onClick={() => setExpandedJudge(isExpanded ? null : opinion.judge_key)}
                      >
                        <JudgeAvatar judgeKey={opinion.judge_key} color={config?.color || '#888'} size={36} />
                        <div className="flex-1">
                          <p className="font-medium">{opinion.judge_display_name}</p>
                          <p className="text-xs text-text-secondary">{opinion.judge_title}</p>
                        </div>
                        <Badge variant="judge" color={config?.color}>
                          {opinion.verdict_for?.toUpperCase()}
                        </Badge>
                        <svg
                          className={`w-5 h-5 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {isExpanded && (
                        <CardContent className="border-t border-border">
                          <div className="font-reading text-sm leading-relaxed whitespace-pre-wrap mb-4">
                            {opinion.reasoning}
                          </div>

                          {/* Scores */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium mb-2">{caseData.creator?.display_name}</p>
                              {opinion.score_participant_a && (
                                <>
                                  <p className="font-mono text-lg font-bold">{opinion.score_participant_a.overall}/10</p>
                                  <p className="text-xs text-success mt-1">{opinion.score_participant_a.strengths}</p>
                                  <p className="text-xs text-error mt-1">{opinion.score_participant_a.weaknesses}</p>
                                </>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">{caseData.opponent?.display_name}</p>
                              {opinion.score_participant_b && (
                                <>
                                  <p className="font-mono text-lg font-bold">{opinion.score_participant_b.overall}/10</p>
                                  <p className="text-xs text-success mt-1">{opinion.score_participant_b.strengths}</p>
                                  <p className="text-xs text-error mt-1">{opinion.score_participant_b.weaknesses}</p>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Notable moments */}
                          {opinion.notable_moments && opinion.notable_moments.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-1">Notable Moments</p>
                              <ul className="text-sm text-text-secondary space-y-1">
                                {opinion.notable_moments.map((m, i) => (
                                  <li key={i} className="pl-3 border-l-2 border-border">{m}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}

                {stage === 'judges' && (
                  <div className="text-center mt-4">
                    <Button variant="secondary" onClick={() => advanceStage('scores')}>
                      View Score Comparison →
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Radar chart */}
            {(stage === 'scores' || stage === 'recommendations' || stage === 'synthesis') && (
              <Card className="mt-8">
                <CardContent>
                  <h2 className="font-display text-2xl font-semibold mb-4">Score Comparison</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={buildRadarData()}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                        <Radar
                          name={caseData.creator?.display_name || 'Participant A'}
                          dataKey={caseData.creator?.display_name || 'Participant A'}
                          stroke="var(--primary)"
                          fill="var(--primary)"
                          fillOpacity={0.2}
                        />
                        <Radar
                          name={caseData.opponent?.display_name || 'Participant B'}
                          dataKey={caseData.opponent?.display_name || 'Participant B'}
                          stroke="var(--accent)"
                          fill="var(--accent)"
                          fillOpacity={0.2}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {stage === 'scores' && (
                    <div className="text-center mt-4">
                      <Button variant="secondary" onClick={() => advanceStage('recommendations')}>
                        View Your Recommendations →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {(stage === 'recommendations' || stage === 'synthesis') && userRecommendations && (
              <Card className="mt-8 border-accent/20">
                <CardContent>
                  <h2 className="font-display text-2xl font-semibold mb-4">Your Recommendations</h2>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm font-medium text-success mb-1">Strongest Point</p>
                      <p className="text-sm">{userRecommendations.strongest_point}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-error/5 border border-error/20">
                      <p className="text-sm font-medium text-error mb-1">Biggest Weakness</p>
                      <p className="text-sm">{userRecommendations.biggest_weakness}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm font-medium text-primary mb-1">How to Improve</p>
                      <p className="text-sm">{userRecommendations.improvement_suggestion}</p>
                    </div>
                  </div>

                  {stage === 'recommendations' && (
                    <div className="text-center mt-6">
                      <Button variant="secondary" onClick={() => advanceStage('synthesis')}>
                        View Balanced Synthesis →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Synthesis */}
            {stage === 'synthesis' && verdict.synthesis && (
              <Card className="mt-8">
                <CardContent>
                  <h2 className="font-display text-2xl font-semibold mb-4">Balanced Synthesis</h2>
                  <div className="font-reading text-base leading-relaxed whitespace-pre-wrap">
                    {verdict.synthesis}
                  </div>

                  {verdict.unresolved_questions && verdict.unresolved_questions.length > 0 && (
                    <div className="mt-6 p-4 rounded-lg bg-bg">
                      <p className="text-sm font-medium mb-2">Unresolved Questions</p>
                      <ul className="space-y-1">
                        {verdict.unresolved_questions.map((q, i) => (
                          <li key={i} className="text-sm text-text-secondary pl-3 border-l-2 border-accent">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}
