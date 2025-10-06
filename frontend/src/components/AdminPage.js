import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Car, 
  DollarSign, 
  Users, 
  TrendingUp,
  LogOut
} from 'lucide-react';
import { mockCars, mockJetSkis } from '../data/mockData';
import { useToast } from '../hooks/use-toast';

const AdminPage = () => {
  const [cars, setCars] = useState(mockCars);
  const [jetskis, setJetSkis] = useState(mockJetSkis);
  const [activeTab, setActiveTab] = useState('cars');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newCar, setNewCar] = useState({
    brand: '',
    year: new Date().getFullYear(),
    model: '',
    mileage: '',
    price: '',
    fuel: 'Gasolina',
    transmission: 'Manual',
    color: '',
    description: '',
    images: [],
    featured: false,
    type: 'car'
  });
  const [newJetSki, setNewJetSki] = useState({
    brand: '',
    year: new Date().getFullYear(),
    model: '',
    hours: '',
    price: '',
    engine: '',
    passengers: 1,
    fuel: 'Gasolina',
    color: '',
    description: '',
    images: [],
    featured: false,
    type: 'jetski'
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddCar = () => {
    const carWithId = {
      ...newCar,
      id: Date.now(),
      images: newCar.images.length > 0 ? newCar.images : ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop'],
      price: parseFloat(newCar.price),
      mileage: parseInt(newCar.mileage),
      year: parseInt(newCar.year)
    };
    
    setCars(prev => [...prev, carWithId]);
    setShowAddModal(false);
    setNewCar({
      brand: '',
      year: new Date().getFullYear(),
      model: '',
      mileage: '',
      price: '',
      fuel: 'Gasolina',
      transmission: 'Manual',
      color: '',
      description: '',
      images: [],
      featured: false
    });
    
    toast({
      title: "Carro adicionado",
      description: "O veículo foi adicionado com sucesso ao inventário",
    });
  };

  const handleEditCar = () => {
    setCars(prev => prev.map(car => 
      car.id === selectedCar.id ? {
        ...selectedCar,
        price: parseFloat(selectedCar.price),
        mileage: parseInt(selectedCar.mileage),
        year: parseInt(selectedCar.year)
      } : car
    ));
    setShowEditModal(false);
    setSelectedCar(null);
    
    toast({
      title: "Carro atualizado",
      description: "As informações do veículo foram atualizadas",
    });
  };

  const handleDeleteCar = (carId) => {
    if (window.confirm('Tem certeza que deseja remover este veículo?')) {
      setCars(prev => prev.filter(car => car.id !== carId));
      toast({
        title: "Carro removido",
        description: "O veículo foi removido do inventário",
      });
    }
  };

  const openEditModal = (car) => {
    setSelectedCar({ ...car });
    setShowEditModal(true);
  };

  // Statistics
  const totalCars = cars.length;
  const totalJetSkis = jetskis.length;
  const totalValue = cars.reduce((sum, car) => sum + car.price, 0) + jetskis.reduce((sum, jetski) => sum + jetski.price, 0);
  const featuredItems = cars.filter(car => car.featured).length + jetskis.filter(jetski => jetski.featured).length;
  const avgPrice = totalValue / (totalCars + totalJetSkis) || 0;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="border-2 border-white rounded px-3 py-1">
              <h1 className="text-lg font-bold text-white">FTC AUTOMÓVEIS</h1>
            </div>
            <h2 className="text-xl text-white">Painel de Administração</h2>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-300"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Carros / Jet-Skis</p>
                <p className="text-2xl font-bold text-white">{totalCars} / {totalJetSkis}</p>
              </div>
              <Car className="text-blue-400" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Valor Total</p>
                <p className="text-2xl font-bold text-white">{formatPrice(totalValue)}</p>
              </div>
              <DollarSign className="text-green-400" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Itens em Destaque</p>
                <p className="text-2xl font-bold text-white">{featuredItems}</p>
              </div>
              <Users className="text-purple-400" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Preço Médio</p>
                <p className="text-2xl font-bold text-white">{formatPrice(avgPrice)}</p>
              </div>
              <TrendingUp className="text-orange-400" size={32} />
            </div>
          </div>
        </div>

        {/* Cars Management */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Gestão de Veículos</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300"
            >
              <Plus size={20} />
              <span>Adicionar Carro</span>
            </button>
          </div>

          {/* Cars Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-700">
                  <th className="text-left p-4">Imagem</th>
                  <th className="text-left p-4">Marca/Modelo</th>
                  <th className="text-left p-4">Ano</th>
                  <th className="text-left p-4">Quilómetros</th>
                  <th className="text-left p-4">Preço</th>
                  <th className="text-left p-4">Destaque</th>
                  <th className="text-left p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4">
                      <img 
                        src={car.images[0]} 
                        alt={`${car.brand} ${car.model}`}
                        className="w-16 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{car.brand}</p>
                        <p className="text-gray-400 text-sm">{car.model}</p>
                      </div>
                    </td>
                    <td className="p-4">{car.year}</td>
                    <td className="p-4">{car.mileage.toLocaleString()} KM</td>
                    <td className="p-4 font-bold text-green-400">{formatPrice(car.price)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${car.featured ? 'bg-green-600' : 'bg-gray-600'}`}>
                        {car.featured ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(car)}
                          className="bg-blue-600 p-2 rounded hover:bg-blue-700 transition-colors duration-300"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCar(car.id)}
                          className="bg-red-600 p-2 rounded hover:bg-red-700 transition-colors duration-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Car Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Adicionar Novo Carro</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Marca</label>
                  <input
                    type="text"
                    value={newCar.brand}
                    onChange={(e) => setNewCar(prev => ({...prev, brand: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    placeholder="Ex: BMW"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Modelo</label>
                  <input
                    type="text"
                    value={newCar.model}
                    onChange={(e) => setNewCar(prev => ({...prev, model: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    placeholder="Ex: 320i"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Ano</label>
                  <input
                    type="number"
                    value={newCar.year}
                    onChange={(e) => setNewCar(prev => ({...prev, year: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    min="2000"
                    max="2025"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Quilómetros</label>
                  <input
                    type="number"
                    value={newCar.mileage}
                    onChange={(e) => setNewCar(prev => ({...prev, mileage: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    placeholder="Ex: 45000"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Preço (€)</label>
                  <input
                    type="number"
                    value={newCar.price}
                    onChange={(e) => setNewCar(prev => ({...prev, price: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    placeholder="Ex: 28500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Combustível</label>
                  <select
                    value={newCar.fuel}
                    onChange={(e) => setNewCar(prev => ({...prev, fuel: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  >
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Elétrico">Elétrico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Transmissão</label>
                  <select
                    value={newCar.transmission}
                    onChange={(e) => setNewCar(prev => ({...prev, transmission: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automática">Automática</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Cor</label>
                  <input
                    type="text"
                    value={newCar.color}
                    onChange={(e) => setNewCar(prev => ({...prev, color: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    placeholder="Ex: Preto"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Descrição</label>
                <textarea
                  value={newCar.description}
                  onChange={(e) => setNewCar(prev => ({...prev, description: e.target.value}))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 h-24"
                  placeholder="Descrição detalhada do veículo..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newCar.featured}
                  onChange={(e) => setNewCar(prev => ({...prev, featured: e.target.checked}))}
                  className="w-4 h-4"
                />
                <label className="text-white font-medium">Destacar na página inicial</label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleAddCar}
                  className="flex-1 bg-green-600 text-white py-3 rounded hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <Save size={20} />
                  <span>Adicionar Carro</span>
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded hover:bg-gray-700 transition-colors duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Car Modal */}
      {showEditModal && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Editar Carro</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Marca</label>
                  <input
                    type="text"
                    value={selectedCar.brand}
                    onChange={(e) => setSelectedCar(prev => ({...prev, brand: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Modelo</label>
                  <input
                    type="text"
                    value={selectedCar.model}
                    onChange={(e) => setSelectedCar(prev => ({...prev, model: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Ano</label>
                  <input
                    type="number"
                    value={selectedCar.year}
                    onChange={(e) => setSelectedCar(prev => ({...prev, year: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Quilómetros</label>
                  <input
                    type="number"
                    value={selectedCar.mileage}
                    onChange={(e) => setSelectedCar(prev => ({...prev, mileage: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Preço (€)</label>
                  <input
                    type="number"
                    value={selectedCar.price}
                    onChange={(e) => setSelectedCar(prev => ({...prev, price: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Combustível</label>
                  <select
                    value={selectedCar.fuel}
                    onChange={(e) => setSelectedCar(prev => ({...prev, fuel: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  >
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Elétrico">Elétrico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Transmissão</label>
                  <select
                    value={selectedCar.transmission}
                    onChange={(e) => setSelectedCar(prev => ({...prev, transmission: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automática">Automática</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Cor</label>
                  <input
                    type="text"
                    value={selectedCar.color}
                    onChange={(e) => setSelectedCar(prev => ({...prev, color: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Descrição</label>
                <textarea
                  value={selectedCar.description}
                  onChange={(e) => setSelectedCar(prev => ({...prev, description: e.target.value}))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 h-24"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedCar.featured}
                  onChange={(e) => setSelectedCar(prev => ({...prev, featured: e.target.checked}))}
                  className="w-4 h-4"
                />
                <label className="text-white font-medium">Destacar na página inicial</label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleEditCar}
                  className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <Save size={20} />
                  <span>Guardar Alterações</span>
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded hover:bg-gray-700 transition-colors duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;