import React from 'react';
import { Plus } from 'lucide-react';

export const Logo = ({ size = 'normal' }: { size?: 'normal' | 'large' }) => {
  const isLarge = size === 'large';

  // Definições de tamanho para facilitar ajustes
  const containerClasses = isLarge ? 'w-14 h-14 rounded-2xl' : 'w-11 h-11 rounded-xl';
  const iconSize = isLarge ? 28 : 22;
  const titleSize = isLarge ? 'text-3xl' : 'text-xl';
  const subtitleSize = isLarge ? 'text-[10px]' : 'text-[9px]';

  return (
    <div className="flex items-center gap-3 select-none transition-transform hover:scale-[1.02]">
      {/* Ícone Estilizado "Premium Shield" */}
      <div className={`
        relative flex items-center justify-center overflow-hidden
        bg-gradient-to-br from-brand-600 to-brand-900
        text-white shadow-lg shadow-brand-900/20
        border border-white/10
        ${containerClasses}
      `}>
        {/* O Ícone de Cruz central */}
        <Plus strokeWidth={3.5} size={iconSize} className="relative z-10 drop-shadow-sm" />

        {/* Efeito de Brilho/Vidro no topo para dar profundidade */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
      </div>

      {/* Tipografia */}
      <div className="flex flex-col justify-center">
        <h1 className={`
          font-heading font-extrabold tracking-tight text-slate-900 leading-none mb-0.5
          ${titleSize}
        `}>
          Pharma<span className="text-brand-600">Prime</span>
        </h1>
        <span className={`
          text-slate-500 font-bold tracking-[0.25em] uppercase font-heading
          ${subtitleSize}
        `}>
          CLUBE SECRETO DA TIRZEPATIDA
        </span>
      </div>
    </div>
  );
};
