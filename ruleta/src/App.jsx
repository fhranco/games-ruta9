import React, { useState, useEffect } from 'react';
import RouletteWheel from './components/RouletteWheel';
import FullscreenButton from './components/FullscreenButton';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, User, Receipt, RotateCcw } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState('welcome'); // welcome, form, playing, result
  const [playerData, setPlayerData] = useState({ name: 'Invitado', receipt: '0000' });
  const [lastPrize, setLastPrize] = useState(null);

  // 🛡️ BLINDAJE KIOSCO
  useEffect(() => {
    // Bloqueo de scroll agresivo
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').catch(() => {});
    }

    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const [canInteract, setCanInteract] = useState(false);

  useEffect(() => {
    setCanInteract(false);
    const timer = setTimeout(() => setCanInteract(true), 800);
    return () => clearTimeout(timer);
  }, [gameState]);

  const handleStart = (e) => {
    if (e) e.preventDefault();
    if (!canInteract) return;
    setPlayerData({ name: 'Invitado', receipt: '0000' });
    setGameState('playing');
  };

  const handleGameFinished = (prize) => {
    setLastPrize(prize);
    setGameState('result');
  };

  const resetGame = (e) => {
    if (e) e.preventDefault();
    if (!canInteract) return;
    setPlayerData({ name: 'Invitado', receipt: '0000' });
    setGameState('welcome');
  };

  const exitGame = (e) => {
    if (e) e.preventDefault();
    if (!canInteract) return;
    window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden bg-r9-dark text-white font-body">
      <FullscreenButton />
      <header className="text-center mb-4">
        <h1 className="text-3xl font-black italic tracking-tighter">
          RUTA<span className="text-r9-red">9</span> <span className="font-light opacity-50">RULETA</span>
        </h1>
      </header>

      <main className="flex-1 flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          {gameState === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-12"
            >
              <h2 className="text-6xl font-black uppercase leading-none tracking-tighter">
                GIRA <br/> y <span className="text-r9-gold">GANA</span>
              </h2>
              <p className="text-white/40 text-lg">Prueba tu suerte con tu boleta de hoy.</p>
              <button 
                onPointerDown={handleStart}
                className={`w-full py-5 sm:py-6 bg-r9-red rounded-2xl font-black text-lg sm:text-xl shadow-[0_8px_0_0_#9B141E] active:translate-y-1 active:shadow-none transition-all uppercase select-none touch-none ${!canInteract ? 'opacity-50' : ''}`}
              >
                EMPEZAR
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
            >
              <RouletteWheel onFinished={handleGameFinished} />
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="p-8 bg-r9-charcoal rounded-3xl border-4 border-r9-gold shadow-[0_0_40px_rgba(255,184,0,0.15)] max-w-xs mx-auto">
                <h3 className="text-r9-gold font-black uppercase tracking-widest mb-4">Resultado</h3>
                <p className="text-3xl sm:text-4xl font-black uppercase mb-2 leading-none italic">{lastPrize.label}</p>
                {lastPrize.couponCode ? (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">CÓDIGO DE CUPÓN</p>
                    <p className="text-lg font-mono font-black text-r9-gold tracking-wider select-all">{lastPrize.couponCode}</p>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2.5">🍔 ¡Feliz Día de la Hamburguesa! 🍔</p>
                    <p className="text-white/30 text-[9px] mt-1 italic">Muestra esta pantalla en caja para validar</p>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-white/40 text-xs italic">¡No te rindas! Vuelve a girar la ruleta para obtener tu premio.</p>
                  </div>
                )}
              </div>

              <div className="w-full max-w-xs mx-auto space-y-4 pt-12">
                <button 
                  onPointerDown={resetGame}
                  className={`w-full py-5 sm:py-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest transition-all active:scale-95 bg-[#C52026] text-white border-2 border-[#C52026] shadow-[0_10px_25px_rgba(197,32,38,0.4)] cursor-pointer select-none touch-none ${!canInteract ? 'opacity-50' : 'hover:bg-[#C52026]/90'}`}
                >
                  NUEVO GIRO
                </button>
                <button 
                  onPointerDown={exitGame}
                  className={`w-full py-5 sm:py-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest transition-all active:scale-95 bg-transparent text-white/20 border-2 border-white/5 cursor-pointer select-none touch-none ${!canInteract ? 'opacity-50' : 'hover:text-white/40 hover:bg-white/5'}`}
                >
                  VOLVER A JUEGOS
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center p-4 opacity-20 text-[8px] uppercase tracking-[0.4em]">
        Propiedad de Ruta9 Magallanes
      </footer>
    </div>
  );
}

export default App;
