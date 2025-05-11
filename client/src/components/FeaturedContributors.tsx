import React from 'react';
import Image from 'next/image';

const contributors = [
  { name: 'Amina Yusuf', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Carlos Rivera', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Priya Singh', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { name: 'Liam Chen', avatar: 'https://randomuser.me/api/portraits/men/65.jpg' },
  { name: 'Fatima Al-Farsi', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
];

export default function FeaturedContributors() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <h2 className="text-xl font-bold mb-4">Featured Contributors</h2>
      <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-200">
        {contributors.map((c, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center min-w-[120px] group cursor-pointer animate-fade-in"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
              <Image src={c.avatar} alt={c.name} width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <span className="font-medium text-sm group-hover:text-blue-700 transition-colors duration-300 text-center">{c.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
} 