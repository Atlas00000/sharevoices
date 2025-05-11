import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function NavigationBar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <Link href="/">
            <span className="text-2xl font-bold text-blue-700 flex items-center gap-2 cursor-pointer">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">SV</span>
              Shared Voices
            </span>
          </Link>
        </div>
        <div className="hidden md:flex gap-6 items-center font-semibold">
          <Link href="/">Home</Link>
          <Link href="/articles">Articles</Link>
          <Link href="/dashboard">Dashboard</Link>
          {user ? (
            <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
        <button className="md:hidden flex items-center" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="material-icons text-3xl">menu</span>
        </button>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 pb-4">
          <Link href="/" className="block py-2" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/articles" className="block py-2" onClick={() => setMenuOpen(false)}>Articles</Link>
          <Link href="/dashboard" className="block py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          {user ? (
            <button onClick={() => { logout(); setMenuOpen(false); }} className="block py-2 text-red-600">Logout</button>
          ) : (
            <>
              <Link href="/login" className="block py-2" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="block py-2" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
} 