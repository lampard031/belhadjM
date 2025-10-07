import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative h-screen bg-cover bg-center bg-no-repeat" 
             style={{
               backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1562141961-d904597d609c?w=1920&h=1080&fit=crop')`
             }}>
      
      {/* Navigation Arrows */}
      <button className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-300 z-10">
        <ChevronLeft size={48} />
      </button>
      <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-300 z-10">
        <ChevronRight size={48} />
      </button>

      <div className="absolute inset-0 flex items-center justify-start">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl ml-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              VIVA A<br />
              <span className="text-white">EXPERIÊNCIA SUPERIOR</span><br />
              <span className="text-white">COM FTC AUTOMÓVEIS</span>
            </h1>
            <p className="text-xl text-white mb-8 font-medium">
              1ª, 2ª, 3ª oportunidade de crédito!
            </p>
            <button className="bg-gray-200 text-gray-900 px-8 py-3 font-bold hover:bg-white transition-colors duration-300 transform hover:scale-105">
              CANDIDATAR AGORA!
            </button>
          </div>
        </div>
      </div>

      {/* Dealership Badge */}
      <div className="absolute bottom-20 right-8 bg-black bg-opacity-70 text-white px-6 py-4 rounded-lg">
        <div className="text-center">
          <div className="border border-white rounded px-3 py-1 mb-2 flex items-center justify-center space-x-2">
            <span className="text-lg">🚗</span>
            <span className="text-sm font-bold">FTC AUTOMÓVEIS</span>
          </div>
          <p className="text-xs">Financiamento 100% aprovado</p>
          <p className="text-sm font-bold">📱 +351 923 575 015</p>
          <p className="text-xs opacity-75">☎️ +351 223 176 692</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;