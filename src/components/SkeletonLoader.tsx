import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  const baseClasses = 'skeleton';

  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-sm',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

interface CardSkeletonProps {
  showIcon?: boolean;
}

export const ClassCardSkeleton: React.FC<CardSkeletonProps> = ({ showIcon = true }) => (
  <div className="glass-card p-5 rounded-xl border transition-smooth">
    <div className="flex gap-3">
      {showIcon && (
        <div className="w-1.5 h-12 rounded-full skeleton" />
      )}
      <div className="flex-1 space-y-3">
        <Skeleton width="60%" height={24} />
        <div className="flex gap-4">
          <Skeleton width={80} height={16} />
          <Skeleton width={80} height={16} />
        </div>
      </div>
    </div>
  </div>
);

export const TodoItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white/5 dark:bg-white/5">
    <div className="w-6 h-6 rounded-full skeleton" />
    <Skeleton width="60%" height={16} />
  </div>
);

export const StatsCardSkeleton: React.FC = () => (
  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-3.5 h-3.5 rounded-full skeleton" />
      <Skeleton width={80} height={14} />
    </div>
    <Skeleton width={60} height={24} />
    <div className="mt-2">
      <Skeleton width={100} height={12} />
    </div>
  </div>
);
