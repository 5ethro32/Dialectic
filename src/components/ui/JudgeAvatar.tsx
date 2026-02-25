interface JudgeAvatarProps {
  judgeKey: string;
  color: string;
  size?: number;
}

export function JudgeAvatar({ judgeKey, color, size = 48 }: JudgeAvatarProps) {
  const shapes: Record<string, JSX.Element> = {
    empiricist: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={`${color}20`} stroke={color} strokeWidth="2" />
        <circle cx="24" cy="24" r="12" fill={`${color}40`} />
        <circle cx="24" cy="24" r="5" fill={color} />
      </svg>
    ),
    logician: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <rect x="2" y="2" width="44" height="44" rx="4" fill={`${color}20`} stroke={color} strokeWidth="2" />
        <rect x="14" y="14" width="20" height="20" fill={`${color}40`} />
        <rect x="20" y="20" width="8" height="8" fill={color} />
      </svg>
    ),
    contrarian: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <polygon points="24,2 46,46 2,46" fill={`${color}20`} stroke={color} strokeWidth="2" />
        <polygon points="24,16 36,40 12,40" fill={`${color}40`} />
        <polygon points="24,26 30,38 18,38" fill={color} />
      </svg>
    ),
    pragmatist: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <polygon points="24,2 44,16 38,42 10,42 4,16" fill={`${color}20`} stroke={color} strokeWidth="2" />
        <polygon points="24,12 36,22 32,38 16,38 12,22" fill={`${color}40`} />
        <circle cx="24" cy="26" r="5" fill={color} />
      </svg>
    ),
    chief_justice: (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={`${color}20`} stroke={color} strokeWidth="2" />
        <polygon points="24,6 30,18 44,20 34,30 36,44 24,38 12,44 14,30 4,20 18,18" fill={`${color}40`} />
        <circle cx="24" cy="24" r="6" fill={color} />
      </svg>
    ),
  };

  return shapes[judgeKey] || shapes.chief_justice;
}
