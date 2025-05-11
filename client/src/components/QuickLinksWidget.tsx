import React from 'react';
import { FaPlus, FaUser, FaCog } from 'react-icons/fa';
import Link from 'next/link';

interface QuickLinksWidgetProps {
  links?: { href: string; label: string; icon: React.ReactNode }[];
  title?: string;
}

const defaultLinks = [
  { href: '/articles/create', label: 'Create Article', icon: <FaPlus className="text-blue-600 group-hover:scale-110 transition-transform" /> },
  { href: '/profile', label: 'View Profile', icon: <FaUser className="text-blue-600 group-hover:scale-110 transition-transform" /> },
  { href: '/settings', label: 'Settings', icon: <FaCog className="text-blue-600 group-hover:scale-110 transition-transform" /> },
];

export default function QuickLinksWidget({ links = defaultLinks, title = 'Quick Links' }: QuickLinksWidgetProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 animate-fade-in">
      <h4 className="font-semibold mb-2">{title}</h4>
      {links.map((l, i) => (
        <Link key={i} href={l.href} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition group ripple">
          {l.icon}
          <span className="font-medium">{l.label}</span>
        </Link>
      ))}
    </div>
  );
} 