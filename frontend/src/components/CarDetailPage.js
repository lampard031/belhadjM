import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { mockCars } from '../data/mockData';
import { ChevronLeft, ChevronRight, Phone, Mail, MapPin, Calculator, CreditCard } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const CarDetailPage = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const foundCar = mockCars.find(c => c.id === parseInt(id));
    setCar(foundCar);
  }, [id]);

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
  };

  const handleReservation = () => {
    // Mock reservation - would integrate with Stripe
    toast({
      title: "Reserva Iniciada",
      description: "Será redirecionado para o pagamento da reserva de 1.000€",
    });
    setShowReservationModal(false);
  };

  const calculateFinancing = (amount, months = 60) => {
    const rate = 0.085 / 12; // 8.5% annual rate
    const monthlyPayment = (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    return monthlyPayment;
  };

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Carro não encontrado</h1>
          <Link to="/inventario" className="text-blue-400 hover:text-blue-300">
            Voltar ao inventário
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-gray-400 mb-8">
          <Link to="/" className="hover:text-white">Início</Link>
          <span className="mx-2">/</span>
          <Link to="/inventario" className="hover:text-white">Inventário</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{car.brand} {car.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="relative bg-gray-800 rounded-lg overflow-hidden mb-4">
              <img 
                src={car.images[currentImageIndex]} 
                alt={`${car.brand} ${car.model}`}
                className="w-full h-96 object-cover"
              />
              
              {car.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-300"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-300"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {car.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? 'bg-white' : 'bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {car.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`rounded overflow-hidden border-2 transition-all duration-300 ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${car.brand} ${car.model} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">{car.brand} {car.model}</h1>
            <p className="text-2xl text-gray-300 mb-6">{car.year}</p>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-3xl font-bold text-green-400 mb-4">
                {formatPrice(car.price)}
              </h2>
              
              {/* Car Specs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-gray-400">Quilómetros:</span>
                  <p className="font-medium">{formatMileage(car.mileage)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Combustível:</span>
                  <p className="font-medium">{car.fuel}</p>
                </div>
                <div>
                  <span className="text-gray-400">Transmissão:</span>
                  <p className="font-medium">{car.transmission}</p>
                </div>
                <div>
                  <span className="text-gray-400">Cor:</span>
                  <p className="font-medium">{car.color}</p>
                </div>
              </div>

              {/* Financing Preview */}
              <div className="bg-gray-700 rounded p-4 mb-6">
                <h3 className="font-bold mb-2 flex items-center">
                  <Calculator className="mr-2" size={20} />
                  Simulação de Financiamento
                </h3>
                <div className="text-sm space-y-1">
                  <p>Prestação mensal (60 meses): <span className="font-bold text-blue-400">{formatPrice(calculateFinancing(car.price, 60))}</span></p>
                  <p className="text-gray-400">TAN: 8,5% | TAEG: 10,2%</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowReservationModal(true)}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <CreditCard size={20} />
                  <span>Reservar por 1.000€</span>
                </button>
                
                <button
                  onClick={() => setShowFinancingModal(true)}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <Calculator size={20} />
                  <span>Simular Financiamento</span>
                </button>
                
                <button className="w-full bg-gray-600 text-white font-bold py-3 rounded hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center space-x-2">
                  <Phone size={20} />
                  <span>Ligar Agora: +351 923 575 015</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Descrição</h3>
              <p className="text-gray-300 leading-relaxed">{car.description}</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Interessado neste veículo?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center text-white">
              <Phone className="mx-auto mb-3 text-green-400" size={32} />
              <h4 className="font-bold mb-2">Ligue-nos</h4>
              <p className="text-gray-300">📱 +351 923 575 015</p>
              <p className="text-gray-300 text-sm">☎️ +351 223 176 692</p>
            </div>
            
            <div className="text-center text-white">
              <Mail className="mx-auto mb-3 text-blue-400" size={32} />
              <h4 className="font-bold mb-2">Email</h4>
              <p className="text-gray-300">info@ftcautomoveis.com</p>
            </div>
            
            <div className="text-center text-white">
              <MapPin className="mx-auto mb-3 text-red-400" size={32} />
              <h4 className="font-bold mb-2">Visite-nos</h4>
              <p className="text-gray-300">Rua das Pedrinhas Brancas, 682<br />Arcozelo VNG</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Reservar Veículo</h3>
            <p className="text-gray-300 mb-6">
              Pretende reservar este {car.brand} {car.model} por 1.000€?
              Este valor será descontado no preço final.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleReservation}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors duration-300"
              >
                Confirmar Reserva
              </button>
              <button
                onClick={() => setShowReservationModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors duration-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CarDetailPage;