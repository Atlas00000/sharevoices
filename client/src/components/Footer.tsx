import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          <div>
            <h4 className="font-bold text-lg mb-2">Shared Voices</h4>
            <p className="text-gray-500 text-sm mb-4 max-w-xs">
              Informing, inspiring, and empowering our global audience on sustainable development, humanitarian practices, and peace.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-blue-700 text-xl">🌐</a>
              <a href="#" className="text-gray-400 hover:text-blue-700 text-xl">🐦</a>
              <a href="#" className="text-gray-400 hover:text-blue-700 text-xl">📸</a>
            </div>
          </div>
          <div className="flex flex-wrap gap-8">
            <div>
              <h5 className="font-semibold mb-2">Categories</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><a href="#" className="hover:underline">SDGs</a></li>
                <li><a href="#" className="hover:underline">Innovation</a></li>
                <li><a href="#" className="hover:underline">Humanitarian</a></li>
                <li><a href="#" className="hover:underline">Peace</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">About</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><a href="#" className="hover:underline">Our Mission</a></li>
                <li><a href="#" className="hover:underline">Team</a></li>
                <li><a href="#" className="hover:underline">Partners</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Legal</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="hover:underline">Terms of Use</a></li>
                <li><a href="#" className="hover:underline">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 text-center mt-8">© 2025 Shared Voices. All rights reserved.</div>
      </div>
    </footer>
  );
} 