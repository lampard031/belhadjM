import React from 'react';
import { Star } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="py-16 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Logo and Service Info */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="border-2 border-white rounded-lg px-8 py-4 mb-8">
              <h1 className="text-3xl font-bold tracking-wider">AUTOS PORTUGAL</h1>
            </div>
            
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Um excelente serviço,<br />
                cortês e à sua escuta!
              </h2>
              
              {/* Google Rating */}
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <div className="bg-white text-black rounded-full p-2 mr-3">
                  <span className="font-bold text-lg">G</span>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-3xl font-bold mr-2">4,5</span>
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-sm text-gray-300">
                    Mais de 287 avaliações no Google
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Description */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">À procura de um veículo?</h3>
              <h2 className="text-3xl font-bold mb-6">
                Bem-vindo à Autos Portugal em Lisboa
              </h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Bem-vindos ao novo site da Autos Portugal. Aqui, temos muito orgulho em oferecer 
                veículos usados de qualidade, a preços competitivos. Todo o nosso pessoal qualificado está 
                ansioso por oferecer um serviço de qualidade irrepreensível no âmbito de uma transação 
                transparente e sem qualquer pressão.
              </p>
              
              <p>
                Na Autos Portugal, temos como mandato servir a clientela da região de Lisboa e 
                arredores de forma a que o vosso nível de satisfação seja à altura da nossa 
                reputação. Estamos no negócio há muito tempo e esperamos encontrar-vos em breve. 
                Somos também especialistas em financiamento e recuperação de crédito em todos 
                os géneros, então não esperem mais e venham visitar-nos hoje. Teremos o prazer de vos servir!
              </p>
              
              <p className="font-medium">
                Toda a equipa da Autos Portugal
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;