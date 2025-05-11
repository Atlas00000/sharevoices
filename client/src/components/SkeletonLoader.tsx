import React from 'react';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
}

export default function SkeletonLoader({ width = 'w-full', height = 'h-6', className = '' }: SkeletonLoaderProps) {
  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${width} ${height} ${className}`}
      style={{ minWidth: 40, minHeight: 16 }}
    />
  );
} 