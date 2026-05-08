import React, { useState, useEffect } from 'react';
import LoadingButton from './LoadingButton';
import { motion } from 'framer-motion';
import { storage } from '../utils/storage';
import { AlertCircle } from 'lucide-react';

export default function PlayerForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [receipt, setReceipt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (receipt.trim().length >= 3) {
      const count = storage.getReceiptPlayCount(receipt);
      setRemaining(Math.max(0, 3 - count));
      if (count >= 3) {
        setError('Esta boleta ya agotó sus 3 intentos permitidos.');
      } else {
        setError('');
      }
    } else {
        setRemaining(null);
        setError('');
    }
  }, [receipt]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    const count = storage.getReceiptPlayCount(receipt);
    if (count >= 3) {
      setError('Boleta agotada. ¡Gracias por participar!');
      return;
    }

    if (name.trim() && receipt.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        onSubmit({ name, receipt });
      }, 1500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col justify-between py-12"
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">Registro de <span className="text-r9-red">Jugador</span></h2>
          <p className="text-white/40 text-lg">Ingresa tu nombre y el número de tu boleta para empezar a ganar cupones.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-r9-gold">Nombre Completo</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck="false"
              className="w-full bg-r9-charcoal border-2 border-white/5 rounded-2xl p-6 text-xl text-white placeholder:text-white/10 focus:border-r9-red outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">N° de Boleta</label>
                {remaining !== null && (
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${remaining > 0 ? 'bg-r9-gold/10 text-r9-gold' : 'bg-r9-red/10 text-r9-red'}`}>
                        {remaining} {remaining === 1 ? 'intento restante' : 'intentos restantes'}
                    </span>
                )}
            </div>
            <input 
              required
              type="text" 
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              placeholder="Ej. 12345"
              autoComplete="off"
              className={`w-full bg-r9-charcoal border-2 rounded-2xl p-6 text-xl text-white placeholder:text-white/10 outline-none transition-all ${error ? 'border-r9-red' : 'border-white/5 focus:border-r9-red'}`}
            />
            {error && (
                <p className="text-r9-red text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle size={14} /> {error}
                </p>
            )}
          </div>
        </form>
      </div>

      <LoadingButton 
        variant="red" 
        onClick={handleSubmit}
        loading={isLoading}
        disabled={!name.trim() || !receipt.trim() || remaining === 0}
      >
        {remaining === 0 ? 'BOLETA AGOTADA' : 'EMPEZAR A JUGAR'}
      </LoadingButton>
    </motion.div>
  );
}
