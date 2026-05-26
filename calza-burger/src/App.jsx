import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BurgerMatcher from './components/BurgerMatcher';
import { calculateBurgerMatchResult, generateCouponCode } from './utils/gameLogic';
import { sounds } from './utils/sounds';
import { Maximize, Minimize, RotateCcw, Box } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState('welcome'); // welcome, form, playing, result
  const [playerData, setPlayerData] = useState({ name: 'Invitado', receipt: '0000' });
  const [result, setResult] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [bestResult, setBestResult] = useState(null);

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

  // Efecto para disparar la fanfarria de resultados y la voz del locutor sintético en español
  useEffect(() => {
    if (gameState === 'result' && result) {
      sounds.playGameResult(result.level);
    }
  }, [gameState, result]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handleStart = () => {
    setAttempts(0);
    setBestResult(null);
    setGameState('playing');
  };

  const handleStop = (position) => {
    sounds.playMatch();
    const gameResult = calculateBurgerMatchResult(position);
    const newAttemptCount = attempts + 1;
    setAttempts(newAttemptCount);

    // Guardamos el mejor resultado
    if (!bestResult || gameResult.score > bestResult.score) {
        setBestResult(gameResult);
    }

    if (gameResult.level === 'perfect' || newAttemptCount >= 5) {
        const finalResult = gameResult.level === 'perfect' ? gameResult : (bestResult?.score > gameResult.score ? bestResult : gameResult);
        const coupon = finalResult.couponPrefix !== 'NONE' ? generateCouponCode(finalResult.couponPrefix) : null;
        setResult({ ...finalResult, coupon });
        setTimeout(() => setGameState('result'), 1000);
    } else {
        setTimeout(() => {
            setGameState('resetting');
            setTimeout(() => setGameState('playing'), 100);
        }, 800);
    }
  };

  const resetGame = () => {
    setPlayerData({ name: 'Invitado', receipt: '0000' });
    setAttempts(0);
    setBestResult(null);
    setGameState('welcome');
  };

  return (
    <div className="h-screen flex flex-col p-4 bg-r9-dark text-white font-body relative overflow-hidden">
      <button 
        onClick={toggleFullscreen}
        className="fixed top-6 right-6 z-[100] p-4 bg-white/5 border border-white/10 rounded-full text-white/20 active:scale-90"
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      <header className="text-center py-8">
        <h1 className="text-3xl font-black italic tracking-tighter flex items-center justify-center gap-2">
          RUTA<span className="text-r9-red">9</span> <span className="font-light opacity-50 uppercase tracking-widest text-sm">Calza la Burger</span>
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
              className="text-center space-y-12 px-6"
            >
              <div className="space-y-6">
                <div className="w-24 h-24 bg-r9-red rounded-full mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(210,31,45,0.4)]">
                    <Box size={48} />
                </div>
                <h2 className="text-6xl font-black uppercase leading-none tracking-tighter">
                  PRECISIÓN <br/> <span className="text-r9-gold">5 INTENTOS</span>
                </h2>
                <p className="text-white/40 text-lg">Tienes 5 oportunidades para lograr un calce perfecto.</p>
              </div>
              <button 
                onClick={handleStart}
                className="w-full py-8 bg-r9-red rounded-3xl font-black text-2xl shadow-[0_12px_0_0_#9B141E] active:translate-y-2 active:shadow-none transition-all uppercase"
              >
                JUGAR
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
              <div className="flex justify-center gap-2 mb-8">
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest border-2 transition-all duration-300
                            ${i < attempts ? 'bg-r9-gold border-r9-gold text-r9-dark opacity-100 shadow-[0_0_15px_rgba(255,184,0,0.3)]' : 
                              i === attempts ? 'bg-white/10 border-white/40 text-white animate-pulse' : 'bg-white/5 border-white/5 text-white/20'}
                        `}
                    >
                        INTENTO {i + 1}
                    </div>
                ))}
              </div>
              <BurgerMatcher onStop={handleStop} attempts={attempts} />
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="p-10 bg-r9-charcoal rounded-[40px] border-4 border-r9-gold shadow-[0_0_60px_rgba(255,184,0,0.15)]">
                <h3 className="text-r9-gold font-black uppercase tracking-[0.3em] text-xs mb-6">Mejor resultado</h3>
                <p className="text-5xl font-black uppercase mb-2 leading-none italic">{result.message}</p>
                <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Intentos usados: {attempts} de 5</p>
                <div className="h-px bg-white/10 w-24 mx-auto my-8" />
                <p className="text-2xl font-bold text-white uppercase mb-1">{result.prize}</p>
                <p className="text-white/40 text-xs italic">{result.condition}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
                <button 
                  onClick={resetGame}
                  className="w-full py-6 bg-white/5 border-2 border-white/10 rounded-3xl font-black flex items-center justify-center gap-4 uppercase text-xl hover:bg-white/10 active:scale-95 transition-all select-none"
                >
                  <RotateCcw size={24} /> NUEVO JUEGO
                </button>
                <button 
                  onClick={() => window.parent.postMessage({ type: 'EXIT_GAME' }, '*')}
                  className="w-full py-6 bg-r9-red border-2 border-r9-red rounded-3xl font-black flex items-center justify-center gap-4 uppercase text-xl shadow-[0_6px_0_0_#9B141E] hover:bg-r9-red/90 active:translate-y-1 active:shadow-none active:scale-95 transition-all select-none"
                >
                  VOLVER A MENÚ
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center p-6 opacity-20 text-[10px] uppercase tracking-[0.5em]">
        Ruta9 Precision Burger Engine v1.0
      </footer>
    </div>
  );
}

export default App;
