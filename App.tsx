import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Search } from './pages/Search';
import { Payment } from './pages/Payment';

// Criamos esse componente interno para podermos ler a URL atual
const AppContent = () => {
  const location = useLocation();
  
  // Verifica se estamos na rota de admin ou de pagamento
  const hideNavbar = location.pathname.startsWith('/admin') || location.pathname.startsWith('/payment');

  return (
    // Removemos o espaço extra do rodapé (pb-32) quando a navbar estiver escondida
    <div className={`min-h-screen bg-slate-50 ${hideNavbar ? '' : 'pb-32 md:pb-0'}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/payment/:id" element={<Payment />} /> 
      </Routes>
      
      {/* A Navbar SÓ será renderizada se hideNavbar for FALSO */}
      {!hideNavbar && <Navbar />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
