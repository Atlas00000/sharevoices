import React from 'react';
import Image from 'next/image';

const trending = [
  {
    title: 'Youth-Led Climate Action',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Innovative Water Solutions',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Peacebuilding Through Education',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Sustainable Cities Revolution',
    image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Empowering Women in Tech',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
  },
];

export default function TrendingArticles() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-4">Trending Articles</h2>
      <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-200">
        {trending.map((item, idx) => (
          <div
            key={idx}
            className="min-w-[220px] bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-300 flex-shrink-0 cursor-pointer group transform hover:scale-105 animate-fade-in"
          >
            <div className="h-32 w-full rounded-t-xl overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                width={300}
                height={200}
                className="rounded-lg group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-base group-hover:text-blue-700 transition-colors duration-300 line-clamp-2">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 