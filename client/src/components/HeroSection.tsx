import React from 'react';

export default function HeroSection() {
  return (
    <section className="w-full bg-gradient-to-r from-gray-800 to-gray-600 text-white py-20 flex flex-col items-center justify-center relative">
      <div className="max-w-4xl mx-auto text-center z-10">
        <span className="inline-block bg-blue-700 text-white px-4 py-1 rounded-full text-xs font-semibold mb-4">Sustainable Development</span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Informing, Inspiring,<br />
          and Empowering Global Action
        </h1>
        <p className="text-lg mb-8 opacity-90">
          Dedicated to sustainable development, innovation, humanitarian practices, and peace.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">Explore Stories</button>
          <button className="bg-white text-blue-700 hover:bg-blue-100 font-semibold px-6 py-3 rounded-lg transition border border-blue-700">Learn More (SDG)</button>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 md:w-64 md:h-64 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
          <span className="text-6xl text-white opacity-30">🖼️</span>
        </div>
      </div>
    </section>
  );
} 