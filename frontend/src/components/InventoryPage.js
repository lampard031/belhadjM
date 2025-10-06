import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { mockCars, mockBrands, mockYears } from '../data/mockData';
import { Link } from 'react-router-dom';
import { Eye, Heart, Filter } from 'lucide-react';

const InventoryPage = () => {
  const [cars] = useState(mockCars);
  const [filteredCars, setFilteredCars] = useState(mockCars);
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    year: '',
    fuel: '',
    transmission: ''
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

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('pt-PT').format(mileage) + ' KM';
  };

  const applyFilters = () => {
    let filtered = cars.filter(car => {
      return (
        (!filters.brand || car.brand === filters.brand) &&
        (!filters.year || car.year.toString() === filters.year) &&
        (!filters.minPrice || car.price >= parseInt(filters.minPrice)) &&
        (!filters.maxPrice || car.price <= parseInt(filters.maxPrice)) &&
        (!filters.fuel || car.fuel === filters.fuel) &&
        (!filters.transmission || car.transmission === filters.transmission)
      );
    });
    setFilteredCars(filtered);
  };

  React.useEffect(() => {
    applyFilters();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Nosso Inventário
          </h1>
          <p className="text-gray-300 text-lg">
            Descubra a nossa seleção de veículos de qualidade
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
                    {mockBrands.map(brand => (
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

                {/* Fuel Type */}
                <div>
                  <label className="block text-white font-medium mb-2">Combustível</label>
                  <select
                    value={filters.fuel}
                    onChange={(e) => setFilters(prev => ({...prev, fuel: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Elétrico">Elétrico</option>
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-white font-medium mb-2">Transmissão</label>
                  <select
                    value={filters.transmission}
                    onChange={(e) => setFilters(prev => ({...prev, transmission: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Todas</option>
                    <option value="Manual">Manual</option>
                    <option value="Automática">Automática</option>
                  </select>
                </div>

                <button
                  onClick={() => setFilters({brand: '', minPrice: '', maxPrice: '', year: '', fuel: '', transmission: ''})}
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors duration-300"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Cars Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {filteredCars.length} veículos encontrados
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <div key={car.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700 hover:border-gray-500 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative group">
                    <img 
                      src={car.images[0]} 
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                      <Link 
                        to={`/carro/${car.id}`}
                        className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
                      >
                        <Eye size={20} />
                      </Link>
                      <button className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors duration-300">
                        <Heart size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {car.brand} {car.year}
                      </h3>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      {car.model}
                    </h4>
                    <div className="space-y-1 mb-3 text-gray-400 text-sm">
                      <p>{formatMileage(car.mileage)}</p>
                      <p>{car.fuel} • {car.transmission}</p>
                      <p>Cor: {car.color}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-400">
                        {formatPrice(car.price)}
                      </span>
                      <Link 
                        to={`/carro/${car.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300 text-sm font-medium"
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCars.length === 0 && (
              <div className="text-center text-white py-12">
                <h3 className="text-2xl font-bold mb-4">Nenhum veículo encontrado</h3>
                <p className="text-gray-400 mb-6">
                  Tente ajustar os seus filtros para encontrar mais opções.
                </p>
                <button
                  onClick={() => setFilters({brand: '', minPrice: '', maxPrice: '', year: '', fuel: '', transmission: ''})}
                  className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors duration-300"
                >
                  Ver Todos os Carros
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

export default InventoryPage;