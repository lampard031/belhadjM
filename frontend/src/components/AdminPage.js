import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Car, 
  DollarSign, 
  Users, 
  TrendingUp,
  LogOut,
  Waves
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Logo from './Logo';
import { carsAPI, jetskisAPI, adminAPI, handleAPIError } from '../services/api';

const AdminPage = () => {
  const [cars, setCars] = useState([]);
  const [jetskis, setJetSkis] = useState([]);
  const [stats, setStats] = useState({
    cars_count: 0,
    jetskis_count: 0,
    total_vehicles: 0,
    avg_car_price: 0,
    avg_jetski_price: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cars');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    brand: '',
    year: new Date().getFullYear(),
    model: '',
    price: '',
    color: '',
    description: '',
    images: [],
    featured: false,
    // Car specific
    mileage: '',
    fuel: 'Gasolina',
    transmission: 'Manual',
    // JetSki specific
    hours: '',
    engine: '',
    passengers: 1
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Check if admin is authenticated via API
        const authResponse = await adminAPI.getStatus();
        if (!authResponse.data.logged_in) {
          navigate('/admin');
          return;
        }

        // Load all data
        const [carsResponse, jetskisResponse, statsResponse] = await Promise.all([
          carsAPI.getAll(),
          jetskisAPI.getAll(),
          adminAPI.getStats()
        ]);

        setCars(carsResponse.data);
        setJetSkis(jetskisResponse.data);
        setStats(statsResponse.data.stats);
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do painel administrativo",
          variant: "destructive",
        });
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await adminAPI.logout();
      toast({
        title: "Sucesso",
        description: "Sessão encerrada com sucesso",
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/admin');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const resetNewItem = () => {
    setNewItem({
      brand: '',
      year: new Date().getFullYear(),
      model: '',
      price: '',
      color: '',
      description: '',
      images: [],
      featured: false,
      // Car specific
      mileage: '',
      fuel: 'Gasolina',
      transmission: 'Manual',
      // JetSki specific
      hours: '',
      engine: '',
      passengers: 1
    });
  };

  const handleAddItem = async () => {
    try {
      const itemData = {
        ...newItem,
        images: newItem.images.length > 0 ? newItem.images : ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop'],
        price: parseFloat(newItem.price),
        year: parseInt(newItem.year),
        type: activeTab === 'cars' ? 'car' : 'jetski'
      };

      let response;
      if (activeTab === 'cars') {
        itemData.mileage = parseInt(newItem.mileage);
        response = await carsAPI.create(itemData);
        // Refresh cars list
        const carsResponse = await carsAPI.getAll();
        setCars(carsResponse.data);
      } else {
        itemData.hours = parseInt(newItem.hours);
        itemData.passengers = parseInt(newItem.passengers);
        response = await jetskisAPI.create(itemData);
        // Refresh jetskis list
        const jetskisResponse = await jetskisAPI.getAll();
        setJetSkis(jetskisResponse.data);
      }

      // Refresh stats
      const statsResponse = await adminAPI.getStats();
      setStats(statsResponse.data.stats);
      
      setShowAddModal(false);
      resetNewItem();
      
      toast({
        title: activeTab === 'cars' ? "Carro adicionado" : "Jet-ski adicionado",
        description: `O veículo foi adicionado com sucesso ao inventário`,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar veículo. Verifique se está autenticado.",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = () => {
    const updatedItem = {
      ...selectedItem,
      price: parseFloat(selectedItem.price),
      year: parseInt(selectedItem.year)
    };

    if (activeTab === 'cars') {
      updatedItem.mileage = parseInt(selectedItem.mileage);
      setCars(prev => prev.map(car => 
        car.id === selectedItem.id ? updatedItem : car
      ));
    } else {
      updatedItem.hours = parseInt(selectedItem.hours);
      updatedItem.passengers = parseInt(selectedItem.passengers);
      setJetSkis(prev => prev.map(jetski => 
        jetski.id === selectedItem.id ? updatedItem : jetski
      ));
    }
    
    setShowEditModal(false);
    setSelectedItem(null);
    
    toast({
      title: activeTab === 'cars' ? "Carro atualizado" : "Jet-ski atualizado",
      description: "As informações do veículo foram atualizadas",
    });
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Tem certeza que deseja remover este veículo?')) {
      if (activeTab === 'cars') {
        setCars(prev => prev.filter(car => car.id !== itemId));
      } else {
        setJetSkis(prev => prev.filter(jetski => jetski.id !== itemId));
      }
      
      toast({
        title: activeTab === 'cars' ? "Carro removido" : "Jet-ski removido",
        description: "O veículo foi removido do inventário",
      });
    }
  };

  const openEditModal = (item) => {
    setSelectedItem({ ...item });
    setShowEditModal(true);
  };

  // Statistics
  const totalCars = cars.length;
  const totalJetSkis = jetskis.length;
  const totalValue = cars.reduce((sum, car) => sum + car.price, 0) + jetskis.reduce((sum, jetski) => sum + jetski.price, 0);
  const featuredItems = cars.filter(car => car.featured).length + jetskis.filter(jetski => jetski.featured).length;
  const avgPrice = totalValue / (totalCars + totalJetSkis) || 0;

  const currentItems = activeTab === 'cars' ? cars : jetskis;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="border-2 border-white rounded px-3 py-2 bg-black bg-opacity-50">
              <Logo size="medium" />
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

        {/* Vehicles Management */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Gestão de Veículos</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300"
              >
                <Plus size={20} />
                <span>Adicionar {activeTab === 'cars' ? 'Carro' : 'Jet-Ski'}</span>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('cars')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'cars' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Car size={20} />
                <span>Carros ({totalCars})</span>
              </button>
              <button
                onClick={() => setActiveTab('jetskis')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'jetskis' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Waves size={20} />
                <span>Jet-Skis ({totalJetSkis})</span>
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-700">
                  <th className="text-left p-4">Imagem</th>
                  <th className="text-left p-4">Marca/Modelo</th>
                  <th className="text-left p-4">Ano</th>
                  <th className="text-left p-4">{activeTab === 'cars' ? 'Quilómetros' : 'Horas'}</th>
                  <th className="text-left p-4">Preço</th>
                  <th className="text-left p-4">Destaque</th>
                  <th className="text-left p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4">
                      <img 
                        src={item.images[0]} 
                        alt={`${item.brand} ${item.model}`}
                        className="w-16 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{item.brand}</p>
                        <p className="text-gray-400 text-sm">{item.model}</p>
                      </div>
                    </td>
                    <td className="p-4">{item.year}</td>
                    <td className="p-4">
                      {activeTab === 'cars' 
                        ? `${item.mileage?.toLocaleString()} KM`
                        : `${item.hours} h`
                      }
                    </td>
                    <td className="p-4 font-bold text-green-400">{formatPrice(item.price)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${item.featured ? 'bg-green-600' : 'bg-gray-600'}`}>
                        {item.featured ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="bg-blue-600 p-2 rounded hover:bg-blue-700 transition-colors duration-300"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                {activeTab === 'cars' ? <Car size={24} /> : <Waves size={24} />}
                <span>Adicionar {activeTab === 'cars' ? 'Carro' : 'Jet-Ski'}</span>
              </h3>
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
                    value={newItem.brand}
                    onChange={(e) => setNewItem(prev => ({...prev, brand: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    placeholder="Ex: BMW"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Modelo</label>
                  <input
                    type="text"
                    value={newItem.model}
                    onChange={(e) => setNewItem(prev => ({...prev, model: e.target.value}))}
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
                    value={newItem.year}
                    onChange={(e) => setNewItem(prev => ({...prev, year: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    min="2000"
                    max="2025"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    {activeTab === 'cars' ? 'Quilómetros' : 'Horas de Uso'}
                  </label>
                  <input
                    type="number"
                    value={activeTab === 'cars' ? newItem.mileage : newItem.hours}
                    onChange={(e) => setNewItem(prev => ({
                      ...prev, 
                      [activeTab === 'cars' ? 'mileage' : 'hours']: e.target.value
                    }))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    placeholder={activeTab === 'cars' ? "Ex: 45000" : "Ex: 120"}
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Preço (€)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem(prev => ({...prev, price: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    placeholder="Ex: 28500"
                  />
                </div>
              </div>

              {activeTab === 'cars' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Combustível</label>
                    <select
                      value={newItem.fuel}
                      onChange={(e) => setNewItem(prev => ({...prev, fuel: e.target.value}))}
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
                      value={newItem.transmission}
                      onChange={(e) => setNewItem(prev => ({...prev, transmission: e.target.value}))}
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
                      value={newItem.color}
                      onChange={(e) => setNewItem(prev => ({...prev, color: e.target.value}))}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                      placeholder="Ex: Preto"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Motor</label>
                    <input
                      type="text"
                      value={newItem.engine}
                      onChange={(e) => setNewItem(prev => ({...prev, engine: e.target.value}))}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                      placeholder="Ex: 1812cc"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Passageiros</label>
                    <select
                      value={newItem.passengers}
                      onChange={(e) => setNewItem(prev => ({...prev, passengers: e.target.value}))}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    >
                      <option value={1}>1 pessoa</option>
                      <option value={2}>2 pessoas</option>
                      <option value={3}>3 pessoas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Cor</label>
                    <input
                      type="text"
                      value={newItem.color}
                      onChange={(e) => setNewItem(prev => ({...prev, color: e.target.value}))}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                      placeholder="Ex: Azul/Branco"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white font-medium mb-2">Descrição</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({...prev, description: e.target.value}))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 h-24"
                  placeholder="Descrição detalhada do veículo..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newItem.featured}
                  onChange={(e) => setNewItem(prev => ({...prev, featured: e.target.checked}))}
                  className="w-4 h-4"
                />
                <label className="text-white font-medium">Destacar na página inicial</label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleAddItem}
                  className="flex-1 bg-green-600 text-white py-3 rounded hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <Save size={20} />
                  <span>Adicionar {activeTab === 'cars' ? 'Carro' : 'Jet-Ski'}</span>
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

      {/* Edit Modal - Similar structure but with selectedItem */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                {activeTab === 'cars' ? <Car size={24} /> : <Waves size={24} />}
                <span>Editar {activeTab === 'cars' ? 'Carro' : 'Jet-Ski'}</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Similar form fields as add modal but using selectedItem */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleEditItem}
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