import type { ReactNode, MouseEvent } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <div 
      className={`backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
