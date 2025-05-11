import React from 'react';
import Image from 'next/image';

interface UserProfileCardProps {
  name: string;
  role: string;
  email: string;
  articlesCount?: number;
  commentsCount?: number;
}

export default function UserProfileCard({ name, role, email, articlesCount = 0, commentsCount = 0 }: UserProfileCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 overflow-hidden">
        <Image
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=128`}
          alt={name}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-xl font-bold mb-1">{name}</h3>
      <span className="text-blue-600 font-semibold text-sm mb-2 capitalize">{role}</span>
      <span className="text-gray-400 text-xs mb-4">{email}</span>
      <div className="flex gap-6 mt-2">
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{articlesCount}</span>
          <span className="text-xs text-gray-500">Articles</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{commentsCount}</span>
          <span className="text-xs text-gray-500">Comments</span>
        </div>
      </div>
    </div>
  );
} 