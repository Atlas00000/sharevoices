import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import HeroSection from '../components/HeroSection';
import ArticleCard from '../components/ArticleCard';
import CategoryCard from '../components/CategoryCard';
import NewsletterSection from '../components/NewsletterSection';
import Footer from '../components/Footer';
import { FaLeaf, FaLightbulb, FaUser } from 'react-icons/fa';
import { getFeaturedArticles, getLatestArticles } from '../api/articles';
import { getCategories } from '../api/categories';
import SkeletonLoader from '../components/SkeletonLoader';
import TrendingArticles from '../components/TrendingArticles';
import YourDraftsWidget from '../components/YourDraftsWidget';
import NotificationsWidget from '../components/NotificationsWidget';
import FeaturedContributors from '../components/FeaturedContributors';
import QuickLinksWidget from '../components/QuickLinksWidget';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [featuredStories, setFeaturedStories] = useState<unknown[]>([]);
  const [latestArticles, setLatestArticles] = useState<unknown[]>([]);
  const [categories, setCategories] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [featured, latest, cats] = await Promise.all([
          getFeaturedArticles(),
          getLatestArticles(),
          getCategories(),
        ]);
        setFeaturedStories(Array.isArray(featured) ? featured : []);
        setLatestArticles(Array.isArray(latest) ? latest : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Shared Voices</title>
        <meta name="description" content="Informing, Inspiring, and Empowering Global Action" />
      </Head>
      <div className="max-w-6xl mx-auto flex justify-end mt-4 mb-2">
        <NotificationsWidget />
      </div>
      <HeroSection />
      <TrendingArticles />
      <FeaturedContributors />
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="col-span-1 flex flex-col gap-8">
          <QuickLinksWidget
            title="Explore"
            links={[
              { href: '/articles', label: 'Explore Articles', icon: <FaLeaf className="text-green-600 group-hover:scale-110 transition-transform" /> },
              { href: '/categories', label: 'Browse Categories', icon: <FaLightbulb className="text-yellow-500 group-hover:scale-110 transition-transform" /> },
              { href: '/about', label: 'About Us', icon: <FaUser className="text-blue-600 group-hover:scale-110 transition-transform" /> },
            ]}
          />
          {user && <YourDraftsWidget />}
        </div>
        <div className="col-span-2 flex flex-col gap-8">
          {/* Featured Stories */}
          <section className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Stories</h2>
              <a href="#" className="text-blue-600 hover:underline text-sm font-semibold">View all stories &rarr;</a>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <SkeletonLoader key={i} height="h-48" className="mb-4" />
                ))}
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredStories.map((story: unknown, idx) => (
                  <ArticleCard
                    key={idx}
                    title={(story as Record<string, unknown>).title as string}
                    summary={(story as Record<string, unknown>).summary as string}
                    date={(story as Record<string, unknown>).date as string}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Explore by Category */}
          <section className="w-full bg-blue-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Explore by Category</h2>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonLoader key={i} height="h-32" className="mb-4" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {categories.map((cat: unknown, idx: number) => (
                    <CategoryCard key={idx} icon={<FaLeaf />} title={(cat as Record<string, unknown>).title as string} description={(cat as Record<string, unknown>).description as string} className="transition-transform duration-300 hover:scale-105 hover:shadow-lg animate-fade-in" />
                  ))}
                </div>
              )}
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
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonLoader key={i} height="h-48" className="mb-4" />
                ))}
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {latestArticles.map((article: unknown, idx) => (
                  <ArticleCard
                    key={idx}
                    title={(article as Record<string, unknown>).title as string}
                    summary={(article as Record<string, unknown>).summary as string}
                    date={(article as Record<string, unknown>).date as string}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-center mt-8">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold border">Load More Articles</button>
            </div>
          </section>
        </div>
      </div>

      <NewsletterSection />
      <Footer />
    </>
  );
} 