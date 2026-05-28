import React from 'react';

export default function PrimaryButton({ children, onClick, variant = 'red', className = '', disabled = false }) {
  const baseStyles = "w-full py-5 sm:py-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  
  const variants = {
    red: "bg-r9-red text-white shadow-[0_8px_0_0_#9B141E] hover:bg-[#F52538]",
    gold: "bg-r9-gold text-r9-dark shadow-[0_8px_0_0_#C48D00] hover:bg-[#FFC833]",
    outline: "bg-transparent text-white border-4 border-r9-charcoal hover:bg-r9-charcoal"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
