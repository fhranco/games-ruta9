import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FireExperience from './components/FireExperience';
import { calculateFireRouteResult, generateCouponCode } from './utils/gameLogic';
import { Maximize, Minimize, RotateCcw, Flame } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState('intro'); // intro, form, experience, result
  const [playerData, setPlayerData] = useState({ name: 'Invitado', receipt: '0000' });
  const [result, setResult] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canInteract, setCanInteract] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    document.body.style.overflow = 'hidden';
    
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    setCanInteract(false);
    const timer = setTimeout(() => setCanInteract(true), 800);
    return () => clearTimeout(timer);
  }, [gameState]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handleStart = (e) => {
    if (e) e.preventDefault();
    if (!canInteract) return;
    setPlayerData({ name: 'Invitado', receipt: '0000' });
    setGameState('experience');
  };

  const handleFinish = (level) => {
    const gameResult = calculateFireRouteResult(level);
    const coupon = generateCouponCode(gameResult.couponPrefix);
    setResult({ ...gameResult, level, coupon });
    
    setTimeout(() => {
      setGameState('result');
    }, 1000);
  };

  const resetGame = (e) => {
    if (e) e.preventDefault();
    if (!canInteract) return;
    setPlayerData({ name: 'Invitado', receipt: '0000' });
    setGameState('intro');
  };

  const exitGame = (e) => {
    if (e) e.preventDefault();
    if (!canInteract) return;
    window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
  };

  return (
    <div className="h-screen flex flex-col bg-r9-dark text-white font-body relative overflow-hidden">
      {/* Botón Modo Tótem */}
      <button 
        onClick={toggleFullscreen}
        className="fixed top-6 right-6 z-[100] p-4 bg-white/5 border border-white/10 rounded-full text-white/20 active:scale-90"
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      <AnimatePresence mode="wait">
        {gameState === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12"
          >
            <div className="space-y-6">
              <motion.div 
                animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-32 h-32 bg-r9-red/10 rounded-full mx-auto flex items-center justify-center border-2 border-r9-red/20 shadow-[0_0_60px_rgba(210,31,45,0.2)]"
              >
                <Flame size={64} className="text-r9-red" fill="currentColor" />
              </motion.div>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                LA RUTA <br/> <span className="text-white/20">DEL</span> <br/> <span className="text-r9-gold">FUEGO</span>
              </h1>
              <p className="text-white/40 text-lg max-w-xs mx-auto">Tu pedido está por entrar al punto ruta9. ¿Podrás controlarlo?</p>
            </div>

            <button 
                onPointerDown={handleStart}
                className={`w-full max-w-xs py-8 bg-r9-red rounded-[40px] font-black text-xl shadow-[0_12px_0_0_#9B141E] active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest select-none touch-none ${!canInteract ? 'opacity-50' : ''}`}
            >
                INICIAR EXPERIENCIA
            </button>
          </motion.div>
        )}

        {gameState === 'experience' && (
            <motion.div key="exp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                <FireExperience onFinish={handleFinish} />
            </motion.div>
        )}

        {gameState === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8"
            >
              <div className="w-full max-w-xs p-10 bg-r9-charcoal rounded-[50px] border-4 border-r9-gold shadow-[0_0_80px_rgba(255,184,0,0.2)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-r9-red to-r9-gold" />
                <h3 className="text-r9-gold font-black uppercase tracking-[0.4em] text-[10px] mb-8">Experiencia Finalizada</h3>
                <p className="text-4xl font-black uppercase mb-4 leading-none italic">{result.message}</p>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Fuego: {Math.round(result.level)}%</p>
                
                <div className="h-px bg-white/10 w-24 mx-auto my-10" />
                
                <p className="text-2xl font-black text-white uppercase mb-2">{result.prize}</p>
                <p className="text-white/40 text-[10px] italic max-w-[180px] mx-auto leading-relaxed">{result.condition}</p>
                
                <div className="mt-10 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-2">Tu Cupón</p>
                    <p className="text-xl font-black tracking-tighter text-r9-gold">{result.coupon}</p>
                </div>
              </div>

              <div className="w-full max-w-xs space-y-4">
                <button 
                  onPointerDown={resetGame}
                  className={`w-full py-6 rounded-2xl font-black text-xl uppercase tracking-widest transition-all active:scale-95 bg-white/5 border-2 border-white/10 text-white cursor-pointer select-none touch-none ${!canInteract ? 'opacity-50' : 'hover:bg-white/10'}`}
                >
                  NUEVO JUEGO
                </button>
                <button 
                  onPointerDown={exitGame}
                  className={`w-full py-6 rounded-2xl font-black text-xl uppercase tracking-widest transition-all active:scale-95 bg-r9-gold text-r9-dark cursor-pointer select-none touch-none shadow-[0_8px_0_0_#C48D00] ${!canInteract ? 'opacity-50' : 'hover:bg-[#FFC833]'}`}
                >
                  VOLVER A JUEGOS
                </button>
              </div>
            </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center p-8 opacity-20 text-[8px] uppercase tracking-[0.6em]">
        Ruta9 Cinematic Grill Experience
      </footer>
    </div>
  );
}

export default App;
