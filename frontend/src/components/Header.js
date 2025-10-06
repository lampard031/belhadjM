import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-gray-900 text-white relative z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="border-2 border-white rounded-lg px-6 py-2 bg-transparent hover:bg-white hover:text-gray-900 transition-all duration-300">
              <h1 className="text-xl font-bold tracking-wider">FTC AUTOMÓVEIS</h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="hover:text-gray-300 transition-colors duration-300 font-medium"
            >
              Início
            </Link>
            <Link 
              to="/inventario" 
              className="hover:text-gray-300 transition-colors duration-300 font-medium"
            >
              Inventário
            </Link>
            <button 
              onClick={() => document.getElementById('novos-carros')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-gray-300 transition-colors duration-300 font-medium"
            >
              Novos Carros!
            </button>
            <Link 
              to="/financiamento" 
              className="hover:text-gray-300 transition-colors duration-300 font-medium"
            >
              Financiamento
            </Link>
            <button 
              onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-gray-300 transition-colors duration-300 font-medium"
            >
              Contactar
            </button>
          </nav>

          {/* Contact Info */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin size={16} />
              <span>Lisboa, Portugal</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Phone size={16} />
              <span>+351 210 123 456</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;