import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Calculator, TrendingUp, Shield, Clock } from 'lucide-react';
import { financingRates } from '../data/mockData';

const FinancingPage = () => {
  const [calculator, setCalculator] = useState({
    vehiclePrice: '',
    downPayment: '',
    loanTerm: 60,
    vehicleType: 'used'
  });
  const [results, setResults] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateLoan = () => {
    const vehiclePrice = parseFloat(calculator.vehiclePrice);
    const downPayment = parseFloat(calculator.downPayment) || 0;
    const loanAmount = vehiclePrice - downPayment;
    const months = parseInt(calculator.loanTerm);
    
    const rates = financingRates[calculator.vehicleType];
    const monthlyRate = rates.tan / 100 / 12;
    const taegMonthlyRate = rates.taeg / 100 / 12;
    
    // Calculate monthly payment using TAN
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    
    // Calculate total with TAEG (includes all fees)
    const monthlyPaymentTAEG = (loanAmount * taegMonthlyRate * Math.pow(1 + taegMonthlyRate, months)) / (Math.pow(1 + taegMonthlyRate, months) - 1);
    
    const totalPayment = monthlyPaymentTAEG * months;
    const totalInterest = totalPayment - loanAmount;
    
    setResults({
      loanAmount,
      monthlyPayment: monthlyPaymentTAEG,
      totalPayment,
      totalInterest,
      tan: rates.tan,
      taeg: rates.taeg
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Financiamento Automóvel</h1>
          <p className="text-xl text-blue-200 mb-8">
            Soluções de crédito adaptadas às suas necessidades
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <Calculator className="mx-auto mb-3 text-blue-300" size={48} />
              <h3 className="font-bold mb-2">Simulação Rápida</h3>
              <p className="text-sm text-blue-200">Calcule a sua prestação em segundos</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <TrendingUp className="mx-auto mb-3 text-green-300" size={48} />
              <h3 className="font-bold mb-2">Taxas Competitivas</h3>
              <p className="text-sm text-blue-200">As melhores condições do mercado</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <Shield className="mx-auto mb-3 text-purple-300" size={48} />
              <h3 className="font-bold mb-2">Aprovação Garantida</h3>
              <p className="text-sm text-blue-200">1ª, 2ª, 3ª oportunidade de crédito</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <Clock className="mx-auto mb-3 text-orange-300" size={48} />
              <h3 className="font-bold mb-2">Resposta em 24h</h3>
              <p className="text-sm text-blue-200">Processo rápido e transparente</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calculator */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Calculator className="mr-3" />
              Simulador de Financiamento
            </h2>
            
            <div className="space-y-4">
              {/* Vehicle Type */}
              <div>
                <label className="block text-white font-medium mb-2">Tipo de Veículo</label>
                <select
                  value={calculator.vehicleType}
                  onChange={(e) => setCalculator(prev => ({...prev, vehicleType: e.target.value}))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-blue-500"
                >
                  <option value="new">Novo</option>
                  <option value="used">Usado</option>
                </select>
              </div>

              {/* Vehicle Price */}
              <div>
                <label className="block text-white font-medium mb-2">Preço do Veículo (€)</label>
                <input
                  type="number"
                  placeholder="25000"
                  value={calculator.vehiclePrice}
                  onChange={(e) => setCalculator(prev => ({...prev, vehiclePrice: e.target.value}))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Down Payment */}
              <div>
                <label className="block text-white font-medium mb-2">Entrada (€)</label>
                <input
                  type="number"
                  placeholder="5000"
                  value={calculator.downPayment}
                  onChange={(e) => setCalculator(prev => ({...prev, downPayment: e.target.value}))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Loan Term */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Prazo: {calculator.loanTerm} meses
                </label>
                <input
                  type="range"
                  min={financingRates[calculator.vehicleType].minMonths}
                  max={financingRates[calculator.vehicleType].maxMonths}
                  step="12"
                  value={calculator.loanTerm}
                  onChange={(e) => setCalculator(prev => ({...prev, loanTerm: e.target.value}))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>{financingRates[calculator.vehicleType].minMonths} meses</span>
                  <span>{financingRates[calculator.vehicleType].maxMonths} meses</span>
                </div>
              </div>

              <button
                onClick={calculateLoan}
                disabled={!calculator.vehiclePrice}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300"
              >
                Calcular Financiamento
              </button>
            </div>

            {/* Results */}
            {results && (
              <div className="mt-8 bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Resultado da Simulação</h3>
                <div className="space-y-3 text-white">
                  <div className="flex justify-between">
                    <span>Montante a Financiar:</span>
                    <span className="font-bold">{formatPrice(results.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prestação Mensal:</span>
                    <span className="font-bold text-green-400 text-xl">{formatPrice(results.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Montante Total:</span>
                    <span className="font-bold">{formatPrice(results.totalPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Juros:</span>
                    <span className="font-bold">{formatPrice(results.totalInterest)}</span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between text-sm">
                    <span>TAN:</span>
                    <span>{results.tan}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>TAEG:</span>
                    <span>{results.taeg}%</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-2">
                  <button className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition-colors duration-300">
                    Solicitar Pré-Aprovação
                  </button>
                  <button className="w-full bg-gray-600 text-white font-bold py-2 rounded hover:bg-gray-700 transition-colors duration-300">
                    Falar com Especialista
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Information */}
          <div className="space-y-8">
            {/* Rates Table */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Taxas Praticadas em Portugal</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-white text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-2">Tipo</th>
                      <th className="text-left py-2">TAN</th>
                      <th className="text-left py-2">TAEG</th>
                      <th className="text-left py-2">Prazo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-2">Veículos Novos</td>
                      <td className="py-2 text-green-400">{financingRates.new.tan}%</td>
                      <td className="py-2 text-blue-400">{financingRates.new.taeg}%</td>
                      <td className="py-2">{financingRates.new.minMonths}-{financingRates.new.maxMonths} meses</td>
                    </tr>
                    <tr>
                      <td className="py-2">Veículos Usados</td>
                      <td className="py-2 text-green-400">{financingRates.used.tan}%</td>
                      <td className="py-2 text-blue-400">{financingRates.used.taeg}%</td>
                      <td className="py-2">{financingRates.used.minMonths}-{financingRates.used.maxMonths} meses</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-400 text-xs mt-4">
                * Taxas exemplificativas sujeitas à aprovação do crédito. TAN - Taxa Anual Nominal, TAEG - Taxa Anual Efetiva Global.
              </p>
            </div>

            {/* Process */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Como Funciona?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h4 className="text-white font-medium">Simule o seu crédito</h4>
                    <p className="text-gray-400 text-sm">Use a nossa calculadora para ver as condições</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h4 className="text-white font-medium">Solicite a pré-aprovação</h4>
                    <p className="text-gray-400 text-sm">Preencha o formulário com os seus dados</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h4 className="text-white font-medium">Análise em 24h</h4>
                    <p className="text-gray-400 text-sm">Avaliamos o seu pedido rapidamente</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <h4 className="text-white font-medium">Escolha o seu carro</h4>
                    <p className="text-gray-400 text-sm">Com o crédito aprovado, escolha o veículo ideal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Documentos Necessários</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Cartão de Cidadão ou Bilhete de Identidade</li>
                <li>• Comprovativo de morada</li>
                <li>• Últimos 3 recibos de vencimento</li>
                <li>• Declaração de IRS do último ano</li>
                <li>• Extratos bancários dos últimos 3 meses</li>
                <li>• Documento de identificação fiscal (NIF)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FinancingPage;