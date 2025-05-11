import React from 'react';

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function CategoryCard({ icon, title, description }: CategoryCardProps) {
  return (
    <div className="flex flex-col items-center bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-md transition">
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-semibold text-base mb-1 text-center">{title}</h4>
      <p className="text-gray-500 text-xs text-center">{description}</p>
    </div>
  );
} 