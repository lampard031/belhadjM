import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Logo from './Logo';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication - replace with actual backend call
    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao painel de administração",
        });
        localStorage.setItem('adminAuthenticated', 'true');
        navigate('/admin/dashboard');
      } else {
        toast({
          title: "Erro de autenticação",
          description: "Credenciais inválidas. Tente novamente.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="border-2 border-white rounded-lg px-4 py-3 inline-block mb-4 bg-black bg-opacity-50">
            <Logo size="large" />
          </div>
          <h2 className="text-2xl font-bold text-white">Painel de Administração</h2>
          <p className="text-gray-400 mt-2">Faça login para gerir o inventário</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Nome de Utilizador
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({...prev, username: e.target.value}))}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                placeholder="Digite o seu nome de utilizador"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Palavra-passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                placeholder="Digite a sua palavra-passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !credentials.username || !credentials.password}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>A fazer login...</span>
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <h3 className="text-white font-medium mb-2">Credenciais de Demonstração:</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p><strong>Utilizador:</strong> admin</p>
            <p><strong>Palavra-passe:</strong> admin123</p>
          </div>
        </div>

        {/* Back to Site */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
          >
            ← Voltar ao site
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;