import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export const Navbar = () => {
  const location = useLocation();
  const cartItemsCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-50 md:sticky md:top-0 md:border-b md:border-t-0 md:px-8 md:py-4 md:shadow-sm md:bg-white/95 md:backdrop-blur-sm">
      {/* justify-between = Mobile espalhado
        md:justify-center md:gap-16 = Desktop centralizado e agrupado
      */}
      <div className="max-w-7xl mx-auto flex justify-between items-center md:justify-center md:gap-16">
        
        <Link to="/" className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 transition-all duration-200 ${isActive('/') ? 'text-brand-600 md:scale-105' : 'text-slate-400 hover:text-slate-600 md:hover:text-brand-600'}`}>
          <Home size={24} className="md:w-5 md:h-5" />
          <span className="text-[10px] md:text-sm font-medium md:font-bold md:uppercase md:tracking-wider">Home</span>
        </Link>
        
        <Link to="/search" className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 transition-all duration-200 ${isActive('/search') ? 'text-brand-600 md:scale-105' : 'text-slate-400 hover:text-slate-600 md:hover:text-brand-600'}`}>
          <Search size={24} className="md:w-5 md:h-5" />
          <span className="text-[10px] md:text-sm font-medium md:font-bold md:uppercase md:tracking-wider">Busca</span>
        </Link>

        <Link to="/cart" className={`relative flex flex-col md:flex-row items-center gap-1 md:gap-2 transition-all duration-200 ${isActive('/cart') ? 'text-brand-600 md:scale-105' : 'text-slate-400 hover:text-slate-600 md:hover:text-brand-600'}`}>
          <div className="relative flex items-center">
            <ShoppingCart size={24} className="md:w-5 md:h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-red-500 text-white text-[10px] md:text-xs font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center md:border-2 md:border-white">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] md:text-sm font-medium md:font-bold md:uppercase md:tracking-wider">Carrinho</span>
        </Link>

        <Link to="/profile" className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 transition-all duration-200 ${isActive('/profile') ? 'text-brand-600 md:scale-105' : 'text-slate-400 hover:text-slate-600 md:hover:text-brand-600'}`}>
          <User size={24} className="md:w-5 md:h-5" />
          <span className="text-[10px] md:text-sm font-medium md:font-bold md:uppercase md:tracking-wider">Perfil</span>
        </Link>
        
      </div>
    </nav>
  );
};
