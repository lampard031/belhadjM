import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-gray-900 text-white relative z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Mobile Layout - Logo centered */}
        <div className="flex md:hidden justify-center items-center mb-4">
          <Link to="/" className="flex items-center">
            <div className="border-2 border-white rounded-lg px-6 py-3 bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-300">
              <Logo size="xxl" isMobile={true} />
            </div>
          </Link>
        </div>
        
        {/* Desktop Layout - Logo on left */}
        <div className="flex justify-between items-center">
          {/* Desktop Logo */}
          <div className="hidden md:block">
            <Link to="/" className="flex items-center">
              <div className="border-2 border-white rounded-lg px-6 py-3 bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-300">
                <Logo size="xl" />
              </div>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="hover:text-gray-300 transition-colors duration-300 font-medium text-white flex items-center h-full py-2"
            >
              Início
            </Link>
            <Link 
              to="/inventario" 
              className="hover:text-gray-300 transition-colors duration-300 font-medium text-white flex items-center h-full py-2"
            >
              Carros
            </Link>
            <Link 
              to="/jetskis" 
              className="hover:text-gray-300 transition-colors duration-300 font-medium text-white flex items-center h-full py-2"
            >
              Jet-Skis
            </Link>
            <button 
              onClick={() => document.getElementById('novos-carros')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-gray-300 transition-colors duration-300 font-medium text-white flex items-center h-full py-2 bg-transparent border-0 cursor-pointer"
            >
              Novidades!
            </button>
            <Link 
              to="/financiamento" 
              className="hover:text-gray-300 transition-colors duration-300 font-medium text-white flex items-center h-full py-2"
            >
              Financiamento
            </Link>
            <button 
              onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-gray-300 transition-colors duration-300 font-medium text-white flex items-center h-full py-2 bg-transparent border-0 cursor-pointer"
            >
              Contactar
            </button>
          </nav>

          {/* Contact Info */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin size={16} />
              <span>Arcozelo, Portugal</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Phone size={16} />
              <span>+351 923 575 015</span>
            </div>
          </div>

          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="flex md:hidden justify-center">
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation - Centered */}
        <nav className="flex md:hidden justify-center space-x-4 mt-4">
          <Link 
            to="/" 
            className="hover:text-gray-300 transition-colors duration-300 font-medium text-sm"
          >
            Início
          </Link>
          <Link 
            to="/inventario" 
            className="hover:text-gray-300 transition-colors duration-300 font-medium text-sm"
          >
            Carros
          </Link>
          <Link 
            to="/jetskis" 
            className="hover:text-gray-300 transition-colors duration-300 font-medium text-sm"
          >
            Jet-Skis
          </Link>
          <Link 
            to="/financiamento" 
            className="hover:text-gray-300 transition-colors duration-300 font-medium text-sm"
          >
            Financiamento
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;