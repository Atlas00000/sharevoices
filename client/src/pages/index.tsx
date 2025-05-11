import React from 'react';
import Head from 'next/head';
import HeroSection from '../components/HeroSection';
import ArticleCard from '../components/ArticleCard';
import CategoryCard from '../components/CategoryCard';
import NewsletterSection from '../components/NewsletterSection';
import Footer from '../components/Footer';
import { FaLeaf, FaLightbulb, FaHandsHelping, FaBalanceScale } from 'react-icons/fa';

const featuredStories = [
  {
    badge: 'SDG6',
    badgeColor: 'bg-green-600',
    title: 'Clean Water Initiatives Transform Rural Communities',
    summary: 'How access to clean water is changing lives and promoting sustainable development in rural areas.',
    date: 'May 1, 2025',
  },
  {
    badge: 'NEW',
    badgeColor: 'bg-blue-600',
    title: 'Innovation Hubs Driving Climate Action',
    summary: 'Small-scale innovation hubs are connecting climate action groups and local communities.',
    date: 'May 2, 2025',
  },
  {
    badge: 'PEACE',
    badgeColor: 'bg-yellow-500',
    title: 'Peace Building Through Education',
    summary: 'Education programs foster understanding and promote peaceful conflict resolution.',
    date: 'May 3, 2025',
  },
];

const categories = [
  {
    icon: <FaLeaf className="text-green-600" />, title: 'Sustainable Development Goals', description: 'Explore articles related to the 17 SDGs.'
  },
  {
    icon: <FaLightbulb className="text-yellow-500" />, title: 'Innovation', description: 'Discover new technologies and social innovation.'
  },
  {
    icon: <FaHandsHelping className="text-red-500" />, title: 'Humanitarian Practices', description: 'Best practices for humanitarian work and emergency assistance.'
  },
  {
    icon: <FaBalanceScale className="text-blue-600" />, title: 'Peace & Justice', description: 'Stories about peacebuilding, justice, and strong institutions.'
  },
];

const latestArticles = [
  {
    badge: 'SDG6', badgeColor: 'bg-green-600', title: 'Youth-Led Climate Initiatives Making an Impact', summary: 'Young leaders are breaking the mold in climate action with new ideas.', date: 'May 4, 2025',
  },
  {
    badge: 'INNO', badgeColor: 'bg-yellow-500', title: 'Gender Equality in Tech: Breaking Barriers', summary: 'Highlighting women and girls who are paving the way in tech.', date: 'May 5, 2025',
  },
  {
    badge: 'CITY', badgeColor: 'bg-blue-600', title: 'Sustainable Cities: Urban Planning Revolution', summary: 'How cities are reimagining urban spaces for the future.', date: 'May 6, 2025',
  },
  {
    badge: 'AGRI', badgeColor: 'bg-yellow-600', title: 'Zero Hunger: Agricultural Innovations', summary: 'New approaches to food security and sustainable agriculture.', date: 'May 7, 2025',
  },
  {
    badge: 'EDU', badgeColor: 'bg-red-500', title: 'Quality Education in Remote Areas', summary: 'How technology is improving access to education worldwide.', date: 'May 8, 2025',
  },
  {
    badge: 'ENERGY', badgeColor: 'bg-blue-600', title: 'Clean Energy Transitions in Developing Nations', summary: 'Communities worldwide are rapidly transitioning to renewables.', date: 'May 9, 2025',
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Shared Voices</title>
        <meta name="description" content="Informing, Inspiring, and Empowering Global Action" />
      </Head>
      <HeroSection />

      {/* Featured Stories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Stories</h2>
          <a href="#" className="text-blue-600 hover:underline text-sm font-semibold">View all stories &rarr;</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredStories.map((story, idx) => (
            <ArticleCard key={idx} {...story} />
          ))}
        </div>
      </section>

      {/* Explore by Category */}
      <section className="w-full bg-blue-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Explore by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <CategoryCard key={idx} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Articles</h2>
          <div className="flex gap-2">
            <input type="text" placeholder="Search..." className="px-3 py-2 border rounded-lg text-sm" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">Filter</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {latestArticles.map((article, idx) => (
            <ArticleCard key={idx} {...article} />
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold border">Load More Articles</button>
        </div>
      </section>

      <NewsletterSection />
      <Footer />
    </>
  );
} 