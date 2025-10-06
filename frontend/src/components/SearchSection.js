import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { mockBrands, mockYears } from '../data/mockData';

const SearchSection = () => {
  const [searchFilters, setSearchFilters] = useState({
    brand: '',
    model: '',
    year: '',
    keyword: ''
  });

  const handleSearch = () => {
    // Mock search functionality - would integrate with backend
    console.log('Searching with filters:', searchFilters);
    // Navigate to inventory with filters
    window.location.href = '/inventario';
  };

  return (
    <section className="bg-gray-900 py-8 relative z-10 -mt-20">
      <div className="container mx-auto px-4">
        <div className="bg-gray-800 rounded-lg p-6 shadow-2xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Brand Select */}
            <div>
              <select
                value={searchFilters.brand}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors duration-300"
              >
                <option value="">Marca</option>
                {mockBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Model Input */}
            <div>
              <input
                type="text"
                placeholder="Modelo"
                value={searchFilters.model}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, model: e.target.value }))}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors duration-300"
              />
            </div>

            {/* Year Select */}
            <div>
              <select
                value={searchFilters.year}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, year: e.target.value }))}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors duration-300"
              >
                <option value="">Ano</option>
                {mockYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Keyword Input */}
            <div>
              <input
                type="text"
                placeholder="Palavra-chave"
                value={searchFilters.keyword}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, keyword: e.target.value }))}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors duration-300"
              />
            </div>

            {/* Search Button */}
            <div>
              <button
                onClick={handleSearch}
                className="w-full bg-white text-gray-900 font-bold py-3 px-6 rounded hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
              >
                <Search size={20} />
                <span>PESQUISAR</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;