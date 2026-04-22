import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Search, User, Package } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export const BottomNav = () => {
  const location = useLocation();
  const cartItemsCount = useCartStore((state) => state.items.length);
  const isActive = (path: string) => location.pathname === path;

  // Definição do número e link do WhatsApp
  const WHATSAPP_NUMBER = "559481210411"; 
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=Olá, preciso de ajuda com um pedido.`;

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link 
      to={to} 
      className={`flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-colors
        ${isActive(to) 
          ? 'text-brand-600 md:bg-brand-50 md:font-bold' 
          : 'text-slate-400 md:text-slate-600 md:hover:bg-slate-100'}`}
    >
      <div className="relative">
        <Icon size={24} className="md:w-5 md:h-5" />
        {to === '/cart' && cartItemsCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {cartItemsCount}
          </span>
        )}
      </div>
      <span className="text-[10px] md:text-sm mt-1 md:mt-0 font-medium">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe shadow-lg">
        <div className="flex justify-around items-center h-16">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/search" icon={Search} label="Busca" />
          <NavItem to="/cart" icon={ShoppingCart} label="Carrinho" />
          <NavItem to="/profile" icon={User} label="Perfil" />
        </div>
      </nav>

      {/* Desktop Sidebar / Left Nav */}
      <nav className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex-col p-4">
        <div className="flex items-center gap-2 mb-8 px-2 mt-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Package className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg text-slate-900">PharmaPrime</span>
        </div>
        
        <div className="space-y-2">
          <NavItem to="/" icon={Home} label="Início" />
          <NavItem to="/search" icon={Search} label="Buscar Produtos" />
          <NavItem to="/cart" icon={ShoppingCart} label="Meu Carrinho" />
          <NavItem to="/profile" icon={User} label="Minha Conta" />
        </div>

        <div className="mt-auto p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-2">Precisa de ajuda?</p>
            {/* CORREÇÃO AQUI: O href estava vazio, agora aponta para o link correto */}
            <a 
              href={whatsappLink} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors block"
            >
              Suporte WhatsApp
            </a>
        </div>
      </nav>
    </>
  );
};
