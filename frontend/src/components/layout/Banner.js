import React from 'react';
import { Info } from 'lucide-react';

const Banner = () => {
  return (
    <div 
      data-testid="info-banner"
      className="fixed top-0 left-0 right-0 z-50 bg-[#8b1530] text-white text-sm font-medium py-2.5 px-4 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Info className="h-4 w-4 flex-shrink-0" />
        <span className="text-center">
          Primero se ejecuta la incorporación al espacio de datos. Después se solicita la ayuda para subvencionar esos costes.
        </span>
      </div>
    </div>
  );
};

export default Banner;
