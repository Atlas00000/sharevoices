import React from 'react';
import Link from 'next/link';
import EmptyStateIllustration from './EmptyStateIllustration';
import Image from 'next/image';

const drafts = [
  {
    id: 1,
    title: 'Empowering Rural Communities with Clean Water',
    image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    title: 'Innovation in Education for Peace',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
];

export default function YourDraftsWidget() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
      <h4 className="font-semibold mb-4">Your Drafts</h4>
      {drafts.length === 0 ? (
        <EmptyStateIllustration message="No drafts yet. Start writing your first article!" />
      ) : (
        <div className="flex flex-col gap-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="flex items-center gap-4 bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition group animate-fade-in">
              <Image src={draft.image} alt={draft.title} width={100} height={100} className="rounded-lg group-hover:scale-105 transition-transform duration-300" />
              <div className="flex-1">
                <h5 className="font-medium line-clamp-2">{draft.title}</h5>
              </div>
              <Link href={`/articles/edit/${draft.id}`} className="px-3 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ripple">Edit</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 