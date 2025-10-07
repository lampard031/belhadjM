import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="contacto" className="bg-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="border-2 border-white rounded-lg px-4 py-3 inline-block mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🚗</span>
                <div>
                  <h3 className="text-lg font-bold tracking-wider">FTC AUTOMÓVEIS</h3>
                  <p className="text-xs opacity-75">www.ftcautomoveis.com</p>
                </div>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              O seu concessionário de confiança em Arcozelo. Oferecemos os melhores carros usados e jet-skis 
              com financiamento aprovado e serviço de excelência.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-blue-600 p-2 rounded hover:bg-blue-700 transition-colors duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-pink-600 p-2 rounded hover:bg-pink-700 transition-colors duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-blue-400 p-2 rounded hover:bg-blue-500 transition-colors duration-300">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6">Links Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/inventario" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Carros
                </Link>
              </li>
              <li>
                <Link to="/jetskis" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Jet-Skis
                </Link>
              </li>
              <li>
                <Link to="/financiamento" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Financiamento
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Área Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xl font-bold mb-6">Serviços</h4>
            <ul className="space-y-3 text-gray-400">
              <li>Venda de Carros Usados</li>
              <li>Venda de Jet-Skis</li>
              <li>Financiamento Automóvel</li>
              <li>Recuperação de Crédito</li>
              <li>Avaliação Gratuita</li>
              <li>Garantia Estendida</li>
              <li>Seguro Automóvel</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-6">Contactos</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-blue-400 mt-1 flex-shrink-0" />
                <div className="text-gray-400">
                  <p>Rua das Pedrinhas Brancas, 682</p>
                  <p>4410-365 Arcozelo VNG</p>
                  <p>Portugal</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-green-400 flex-shrink-0" />
                <div className="text-gray-400">
                  <p>📱 +351 923 575 015</p>
                  <p className="text-sm">☎️ +351 223 176 692</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-red-400 flex-shrink-0" />
                <span className="text-gray-400">info@ftcautomoveis.com</span>
              </div>
            </div>

            {/* Hours */}
            <div className="mt-6">
              <h5 className="font-bold mb-2">Horário de Funcionamento</h5>
              <div className="text-gray-400 text-sm space-y-1">
                <p>Segunda - Sexta: 9:00 - 18:00</p>
                <p>Sábado: 9:00 - 16:00</p>
                <p>Domingo: Fechado</p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 FTC Automóveis. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
              Política de Privacidade
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
              Termos de Serviço
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;