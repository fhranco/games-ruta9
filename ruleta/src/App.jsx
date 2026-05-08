import React, { useState, useEffect } from 'react';
import RouletteWheel from './components/RouletteWheel';
import FullscreenButton from './components/FullscreenButton';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, User, Receipt, RotateCcw } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState('welcome'); // welcome, form, playing, result
  const [playerData, setPlayerData] = useState({ name: '', receipt: '' });
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

  const handleStart = () => setGameState('form');
  
  const handleFormSubmit = (data) => {
    setPlayerData(data);
    setGameState('playing');
  };

  const handleGameFinished = (prize) => {
    setLastPrize(prize);
    setGameState('result');
  };

  const resetGame = () => {
    setPlayerData({ name: '', receipt: '' });
    setGameState('welcome');
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
                GIRA <br/> Y <span className="text-r9-gold">GANA</span>
              </h2>
              <p className="text-white/40 text-lg">Prueba tu suerte con tu boleta de hoy.</p>
              <button 
                onClick={handleStart}
                className="w-full py-6 bg-r9-red rounded-2xl font-black text-xl shadow-[0_8px_0_0_#9B141E] active:translate-y-1 active:shadow-none transition-all uppercase"
              >
                EMPEZAR
              </button>
            </motion.div>
          )}

          {gameState === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <h3 className="text-3xl font-black uppercase italic">Registro</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-white/30">Tu Nombre</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-r9-charcoal border-2 border-white/5 rounded-xl p-5 text-lg outline-none focus:border-r9-red transition-all"
                    onChange={(e) => setPlayerData({...playerData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-white/30">N° Boleta</label>
                  <input 
                    type="text" 
                    placeholder="Ej. 12345"
                    className="w-full bg-r9-charcoal border-2 border-white/5 rounded-xl p-5 text-lg outline-none focus:border-r9-red transition-all"
                    onChange={(e) => setPlayerData({...playerData, receipt: e.target.value})}
                  />
                </div>
                <button 
                  onClick={() => handleFormSubmit(playerData)}
                  disabled={!playerData.name || !playerData.receipt}
                  className="w-full py-6 bg-white text-r9-dark rounded-2xl font-black text-xl uppercase disabled:opacity-50"
                >
                  CONTINUAR
                </button>
              </div>
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
              <div className="p-8 bg-r9-charcoal rounded-3xl border-4 border-r9-gold shadow-[0_0_40px_rgba(255,184,0,0.1)]">
                <h3 className="text-r9-gold font-black uppercase tracking-widest mb-4">Resultado</h3>
                <p className="text-5xl font-black uppercase mb-2">{lastPrize.label}</p>
                <p className="text-white/40 text-sm italic">Muestra esta pantalla al personal</p>
              </div>

              <div className="space-y-4 pt-12">
                <button 
                  onClick={resetGame}
                  className="w-full py-5 bg-white/5 border-2 border-white/10 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-white/10 transition-all uppercase"
                >
                  <RotateCcw size={20} /> NUEVO GIRO
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
