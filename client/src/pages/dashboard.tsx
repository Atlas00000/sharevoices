import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import UserProfileCard from '../components/UserProfileCard';
import QuickLinksWidget from '../components/QuickLinksWidget';
import EmptyStateIllustration from '../components/EmptyStateIllustration';
import YourDraftsWidget from '../components/YourDraftsWidget';
import NotificationsWidget from '../components/NotificationsWidget';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!user) {
    return null;
  }

  // Placeholder for user stats and recent activity
  const articlesCount = 3;
  const commentsCount = 7;
  const recentArticles: unknown[] = [];

  return (
    <div className="min-h-screen bg-blue-50 py-10 animate-fade-in">
      <div className="max-w-5xl mx-auto flex justify-end mb-6">
        <NotificationsWidget />
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 flex flex-col gap-8">
          <UserProfileCard name={user.name} role={user.role} email={user.email} articlesCount={articlesCount} commentsCount={commentsCount} />
          <QuickLinksWidget />
          <YourDraftsWidget />
        </div>
        <div className="col-span-2 bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          {recentArticles.length === 0 ? (
            <EmptyStateIllustration message="No recent articles or activity yet. Start by creating your first article!" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Map recent articles here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 