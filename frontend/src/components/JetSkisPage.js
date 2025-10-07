import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { mockJetSkiBrands, mockYears } from '../data/mockData';
import { Link } from 'react-router-dom';
import { Eye, Heart, Filter, Waves } from 'lucide-react';
import { jetskisAPI, handleAPIError } from '../services/api';

const JetSkisPage = () => {
  const [jetskis, setJetskis] = useState([]);
  const [filteredJetSkis, setFilteredJetSkis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    year: '',
    maxHours: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatHours = (hours) => {
    return new Intl.NumberFormat('pt-PT').format(hours) + ' horas';
  };

  const applyFilters = () => {
    let filtered = jetskis.filter(jetski => {
      return (
        (!filters.brand || jetski.brand === filters.brand) &&
        (!filters.year || jetski.year.toString() === filters.year) &&
        (!filters.minPrice || jetski.price >= parseInt(filters.minPrice)) &&
        (!filters.maxPrice || jetski.price <= parseInt(filters.maxPrice)) &&
        (!filters.maxHours || jetski.hours <= parseInt(filters.maxHours))
      );
    });
    setFilteredJetSkis(filtered);
  };

  React.useEffect(() => {
    applyFilters();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Waves size={48} className="text-blue-200 mr-4" />
            <h1 className="text-4xl font-bold text-white">
              Jet-Skis & Motos de Água
            </h1>
          </div>
          <p className="text-blue-200 text-lg">
            Descubra a nossa seleção de jet-skis de qualidade para aventuras aquáticas
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Filtros</h3>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-white"
                >
                  <Filter size={24} />
                </button>
              </div>
              
              <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Brand Filter */}
                <div>
                  <label className="block text-white font-medium mb-2">Marca</label>
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters(prev => ({...prev, brand: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Todas as marcas</option>
                    {mockJetSkiBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-white font-medium mb-2">Ano</label>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters(prev => ({...prev, year: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Todos os anos</option>
                    {mockYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-white font-medium mb-2">Preço</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({...prev, minPrice: e.target.value}))}
                      className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
                      className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Hours Filter */}
                <div>
                  <label className="block text-white font-medium mb-2">Horas Máximas</label>
                  <input
                    type="number"
                    placeholder="Ex: 100"
                    value={filters.maxHours}
                    onChange={(e) => setFilters(prev => ({...prev, maxHours: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={() => setFilters({brand: '', minPrice: '', maxPrice: '', year: '', maxHours: ''})}
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors duration-300"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Jet-Skis Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {filteredJetSkis.length} jet-skis encontrados
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredJetSkis.map((jetski) => (
                <div key={jetski.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative group">
                    <img 
                      src={jetski.images[0]} 
                      alt={`${jetski.brand} ${jetski.model}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                      <Link 
                        to={`/jetski/${jetski.id}`}
                        className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
                      >
                        <Eye size={20} />
                      </Link>
                      <button className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors duration-300">
                        <Heart size={20} />
                      </button>
                    </div>
                    
                    {/* Jet-Ski Badge */}
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      JET-SKI
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {jetski.brand} {jetski.year}
                      </h3>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      {jetski.model}
                    </h4>
                    <div className="space-y-1 mb-3 text-gray-400 text-sm">
                      <p>{formatHours(jetski.hours)}</p>
                      <p>{jetski.engine} • {jetski.passengers} lugares</p>
                      <p>Cor: {jetski.color}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-400">
                        {formatPrice(jetski.price)}
                      </span>
                      <Link 
                        to={`/jetski/${jetski.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300 text-sm font-medium"
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredJetSkis.length === 0 && (
              <div className="text-center text-white py-12">
                <Waves size={64} className="mx-auto mb-4 text-gray-600" />
                <h3 className="text-2xl font-bold mb-4">Nenhum jet-ski encontrado</h3>
                <p className="text-gray-400 mb-6">
                  Tente ajustar os seus filtros para encontrar mais opções.
                </p>
                <button
                  onClick={() => setFilters({brand: '', minPrice: '', maxPrice: '', year: '', maxHours: ''})}
                  className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors duration-300"
                >
                  Ver Todos os Jet-Skis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JetSkisPage;