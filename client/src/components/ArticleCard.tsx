import React from 'react';

interface ArticleCardProps {
  badge?: string;
  badgeColor?: string;
  title: string;
  summary: string;
  date: string;
  link?: string;
}

export default function ArticleCard({ badge, badgeColor = 'bg-blue-600', title, summary, date, link = '#' }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col h-full border border-gray-100">
      {badge && (
        <span className={`inline-block ${badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full mb-2 w-fit`}>{badge}</span>
      )}
      <h3 className="text-lg font-bold mb-2 line-clamp-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">{summary}</p>
      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
        <span>{date}</span>
        <a href={link} className="text-blue-600 hover:underline font-semibold">Read more</a>
      </div>
    </div>
  );
} 