import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/toaster";
import HomePage from "./components/HomePage";
import InventoryPage from "./components/InventoryPage";
import CarDetailPage from "./components/CarDetailPage";
import JetSkisPage from "./components/JetSkisPage";
import JetSkiDetailPage from "./components/JetSkiDetailPage";
import FinancingPage from "./components/FinancingPage";
import AdminPage from "./components/AdminPage";
import AdminLogin from "./components/AdminLogin";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/carro/:id" element={<CarDetailPage />} />
          <Route path="/financiamento" element={<FinancingPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;