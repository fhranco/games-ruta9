import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CookMeter from './components/CookMeter';
import { calculatePerfectPointResult, generateCouponCode } from './utils/gameLogic';
import { sounds } from './utils/sounds';
import { Maximize, Minimize, RotateCcw, Flame } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState('welcome'); // welcome, form, playing, result
  const [playerData, setPlayerData] = useState({ name: '', receipt: '' });
  const [result, setResult] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 🛡️ BLINDAJE KIOSCO
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    document.body.style.overflow = 'hidden';
    
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').catch(() => {});
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const [canInteract, setCanInteract] = useState(false);

  useEffect(() => {
    setCanInteract(false);
    const timer = setTimeout(() => setCanInteract(true), 800);
    return () => clearTimeout(timer);
  }, [gameState]);

  const handleStart = (e) => {
    if (e) e.preventDefault();
    if (!canInteract) return;
    sounds.startFireAmbience();
    setPlayerData({ name: 'Cliente', receipt: '12345' });
    setGameState('playing');
  };

  const handleStop = (position) => {
    sounds.playSizzle();
    const gameResult = calculatePerfectPointResult(position);
    const coupon = generateCouponCode(gameResult.couponPrefix);
    setResult({ ...gameResult, position, coupon });
    
    setTimeout(() => {
      setGameState('result');
    }, 1000);
  };

  const resetGame = (e) => {
    if (e) e.preventDefault();
    if (!canInteract) return;
    setPlayerData({ name: '', receipt: '' });
    setGameState('welcome');
  };

  const exitGame = (e) => {
    if (e) e.preventDefault();
    if (!canInteract) return;
    sounds.stopFire();
    window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
  };

  return (
    <div className="h-screen flex flex-col p-4 bg-r9-dark text-white font-body relative overflow-hidden">
      {/* Botón Modo Tótem */}
      <button 
        onClick={toggleFullscreen}
        className="fixed top-6 right-6 z-[100] p-4 bg-white/5 border border-white/10 rounded-full text-white/20 active:scale-90"
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      <header className="text-center py-8">
        <h1 className="text-3xl font-black italic tracking-tighter flex items-center justify-center gap-2">
          <Flame className="text-r9-red" fill="currentColor" /> RUTA<span className="text-r9-red">9</span> <span className="font-light opacity-50 uppercase tracking-widest text-sm">Punto Perfecto</span>
        </h1>
      </header>

      <main className="flex-1 flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          {gameState === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-6xl font-black uppercase leading-none tracking-tighter">
                  DOMINA <br/> EL <span className="text-r9-gold">FUEGO</span>
                </h2>
                <p className="text-white/40 text-lg max-w-xs mx-auto">Detén el marcador en el punto de cocción perfecta Ruta9 y gana.</p>
              </div>
              <button 
                onClick={handleStart}
                className="w-full py-8 bg-r9-red rounded-3xl font-black text-2xl shadow-[0_12px_0_0_#9B141E] active:translate-y-2 active:shadow-none transition-all uppercase"
              >
                EMPEZAR
              </button>
            </motion.div>
          )}



          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CookMeter onStop={handleStop} />
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="p-10 bg-r9-charcoal rounded-[40px] border-4 border-r9-gold shadow-[0_0_60px_rgba(255,184,0,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-r9-gold opacity-50" />
                <h3 className="text-r9-gold font-black uppercase tracking-[0.3em] text-sm mb-6">Resultado de Cocción</h3>
                <p className="text-5xl font-black uppercase mb-2 leading-none italic">{result.message}</p>
                <div className="h-px bg-white/10 w-24 mx-auto my-8" />
                <p className="text-2xl font-bold text-white uppercase mb-1">{result.prize}</p>
                <p className="text-white/40 text-xs italic">{result.condition}</p>
              </div>

              <div className="space-y-4 pt-8">
                <button 
                  onClick={resetGame}
                  className="w-full py-6 bg-white/5 border-2 border-white/10 rounded-3xl font-black flex items-center justify-center gap-4 hover:bg-white/10 transition-all uppercase text-xl"
                >
                  <RotateCcw size={24} /> NUEVO JUEGO
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center p-6 opacity-20 text-[10px] uppercase tracking-[0.5em]">
        Ruta9 Precision Grill Engine
      </footer>
    </div>
  );
}

export default App;
