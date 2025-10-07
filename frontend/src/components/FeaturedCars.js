import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { carsAPI, handleAPIError } from '../services/api';

const FeaturedCars = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        setLoading(true);
        const response = await carsAPI.getFeatured();
        setFeaturedCars(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured cars:', err);
        setError('Erro ao carregar carros em destaque');
        // Fallback to empty array to prevent crashes
        setFeaturedCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(featuredCars.length / 4));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(featuredCars.length / 4)) % Math.ceil(featuredCars.length / 4));
  };

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

  return (
    <section id="novos-carros" className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 tracking-wider">
          NOVOS CARROS!
        </h2>
        
        <div className="relative">
          {/* Cars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.map((car) => (
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
                  <p className="text-gray-400 mb-3">
                    {formatMileage(car.mileage)}
                  </p>
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

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors duration-300 border border-gray-600"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors duration-300 border border-gray-600"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/inventario"
            className="inline-block bg-white text-gray-900 font-bold py-3 px-8 hover:bg-gray-200 transition-colors duration-300 transform hover:scale-105"
          >
            VER TODOS OS CARROS
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;