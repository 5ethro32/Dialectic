import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'error' | 'judge';
  className?: string;
  color?: string;
}

export function Badge({ children, variant = 'default', className = '', color }: BadgeProps) {
  const variants = {
    default: 'bg-bg text-text-secondary border border-border',
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    error: 'bg-error/10 text-error',
    judge: '',
  };

  const style = color ? { backgroundColor: `${color}15`, color } : {};

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
