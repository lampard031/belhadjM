import React from 'react';
import { FileText, CheckCircle, Car, Clock } from 'lucide-react';

const ProcessSection = () => {
  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Dealership Image */}
          <div className="order-2 lg:order-1">
            <img 
              src="https://images.unsplash.com/photo-1562141961-d904597d609c?w=800&h=600&fit=crop" 
              alt="Concessionário Autos Portugal"
              className="w-full rounded-lg shadow-2xl"
            />
          </div>

          {/* Process Steps */}
          <div className="order-1 lg:order-2 text-white">
            <h2 className="text-3xl font-bold mb-8 text-center lg:text-left">
              Como funciona?
            </h2>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 p-3 rounded-lg flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Preencha o formulário rápido!</h3>
                  <p className="text-gray-300">
                    É PRÉ-APROVADO muito rapidamente em apenas 10 minutos!
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4">
                <div className="bg-green-600 p-3 rounded-lg flex-shrink-0">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Aprovação Instantânea</h3>
                  <p className="text-gray-300">
                    Repartem com o vosso novo veículo! Todas as nossas felicitações.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 p-3 rounded-lg flex-shrink-0">
                  <Car size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Escolha o Seu Carro</h3>
                  <p className="text-gray-300">
                    Explore o nosso inventário e encontre o carro perfeito para si.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-4">
                <div className="bg-orange-600 p-3 rounded-lg flex-shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Reserve Agora</h3>
                  <p className="text-gray-300">
                    Faça uma reserva de 1.000€ para garantir o seu carro dos sonhos.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center lg:text-left">
              <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105">
                COMEÇAR AGORA
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;