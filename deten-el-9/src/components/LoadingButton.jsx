import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingButton({ 
  children, 
  onClick, 
  loading = false, 
  variant = 'red', 
  className = '', 
  disabled = false 
}) {
  const baseStyles = "relative w-full py-5 sm:py-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 overflow-hidden";
  
  const variants = {
    red: "bg-r9-red text-white shadow-[0_8px_0_0_#9B141E] hover:bg-[#F52538]",
    gold: "bg-r9-gold text-r9-dark shadow-[0_8px_0_0_#C48D00] hover:bg-[#FFC833]",
    outline: "bg-transparent text-white border-4 border-r9-charcoal hover:bg-r9-charcoal"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      <div className={`flex items-center justify-center gap-3 transition-transform duration-300 ${loading ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        {children}
      </div>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/20 animate-in fade-in duration-500">
          <Loader2 className="animate-spin" size={28} />
          <span>PROCESANDO...</span>
        </div>
      )}
    </button>
  );
}
