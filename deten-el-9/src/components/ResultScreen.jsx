import React, { useEffect, useState } from 'react';
import PrimaryButton from './PrimaryButton';
import { motion } from 'framer-motion';
import { calculateResult, generateCouponCode } from '../utils/gameLogic';
import { storage } from '../utils/storage';
import { Ticket, Share2, RefreshCcw } from 'lucide-react';
import { sounds } from '../utils/sounds';

export default function ResultScreen({ result, playerData, onReset }) {
  const [outcome, setOutcome] = useState(null);
  const [canInteract, setCanInteract] = useState(false);
  const hasSaved = React.useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanInteract(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleResetPress = (e) => {
    e.preventDefault();
    if (!canInteract) return;
    onReset();
  };

  const handleExitPress = (e) => {
    e.preventDefault();
    if (!canInteract) return;
    window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
  };

  useEffect(() => {
    if (hasSaved.current) return;
    
    const res = calculateResult(result);
    setOutcome(res);
    
    // Play win sound
    sounds.playGameResult(res.level);

    // Persistir jugada (Solo una vez)
    storage.savePlay({
      id: Math.random().toString(36).substr(2, 9),
      playerName: playerData.name,
      receipt: playerData.receipt,
      stoppedTime: result,
      score: res.score,
      message: res.message,
      prize: res.prize
    });

    hasSaved.current = true;
  }, [result, playerData]);

  if (!outcome) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col justify-between py-8"
    >
      <div className="text-center space-y-12">
        <div className="space-y-4">
          <p className="text-white/40 uppercase font-black tracking-[0.3em] text-sm">Resultado Final</p>
          <h2 className="text-9xl font-black text-white italic tracking-tighter">{result.toFixed(3)}s</h2>
        </div>

        <div className="py-12 px-6 bg-r9-charcoal/50 rounded-[40px] border-4 border-r9-gold relative overflow-hidden">
            {outcome.level === 'perfect' && (
                <div className="absolute inset-0 bg-r9-gold/10 animate-pulse" />
            )}
            <h3 className="text-2xl font-black text-r9-gold uppercase mb-4 tracking-tight">{outcome.message}</h3>
            <div className="space-y-2">
                <p className="text-6xl font-black text-white uppercase leading-none">{outcome.prize.split(' ')[0]}</p>
                <p className="text-2xl font-light text-white/60 uppercase tracking-widest">Cupones Ganados</p>
            </div>
        </div>

        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-sm text-white/40 italic">Muestra esta pantalla al personal de <br/> <span className="text-r9-red font-bold not-italic">Ruta9</span> para validar tus tickets.</p>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onPointerDown={handleResetPress}
          className={`w-full py-6 rounded-2xl font-black text-xl uppercase tracking-widest transition-all active:scale-95 bg-white/5 border-2 border-white/10 text-white cursor-pointer select-none touch-none ${!canInteract ? 'opacity-50' : 'hover:bg-white/10'}`}
        >
          NUEVO JUEGO
        </button>
        <button 
          onPointerDown={handleExitPress}
          className={`w-full py-6 rounded-2xl font-black text-xl uppercase tracking-widest transition-all active:scale-95 bg-r9-gold text-r9-dark cursor-pointer select-none touch-none shadow-[0_8px_0_0_#C48D00] ${!canInteract ? 'opacity-50' : 'hover:bg-[#FFC833]'}`}
        >
          VOLVER A JUEGOS
        </button>
        <p className="text-[10px] text-center text-white/20 uppercase tracking-widest pt-2">
           Tótem Digital Ruta 9
        </p>
      </div>
    </motion.div>
  );
}
