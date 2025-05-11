import React from 'react';

export default function NewsletterSection() {
  return (
    <section className="w-full bg-blue-700 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Stay Informed</h3>
          <p className="text-sm opacity-90">Subscribe to our newsletter for the latest stories, insights, and updates on sustainable development.</p>
        </div>
        <form className="flex gap-2 w-full md:w-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="px-4 py-2 rounded-l-lg text-gray-800 focus:outline-none w-full md:w-64"
          />
          <button type="submit" className="bg-blue-900 hover:bg-blue-800 px-5 py-2 rounded-r-lg font-semibold">Subscribe</button>
        </form>
      </div>
    </section>
  );
} 