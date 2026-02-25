'use client';

import { useEffect, useState } from 'react';

interface ConfidenceGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ConfidenceGauge({ score, size = 'md', showLabel = true }: ConfidenceGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const sizes = {
    sm: { width: 60, stroke: 4, fontSize: 'text-sm' },
    md: { width: 100, stroke: 6, fontSize: 'text-2xl' },
    lg: { width: 140, stroke: 8, fontSize: 'text-4xl' },
  };

  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 10) * circumference;

  const getColor = (s: number) => {
    if (s >= 8) return 'var(--success)';
    if (s >= 6) return 'var(--primary)';
    if (s >= 4) return 'var(--accent)';
    return 'var(--error)';
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width, height: width }}>
        <svg width={width} height={width} className="-rotate-90">
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
          />
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={getColor(animatedScore)}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-mono font-bold ${fontSize}`} style={{ color: getColor(animatedScore) }}>
            {animatedScore.toFixed(1)}
          </span>
        </div>
      </div>
      {showLabel && <span className="text-xs text-text-secondary">/10</span>}
    </div>
  );
}
