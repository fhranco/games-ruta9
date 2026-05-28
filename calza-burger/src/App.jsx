import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BurgerMatcher from './components/BurgerMatcher';
import { calculateBurgerMatchResult, generateCouponCode } from './utils/gameLogic';
import { sounds } from './utils/sounds';
import { Maximize, Minimize, RotateCcw, Brain, Trophy, Gamepad2 } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState('welcome'); // welcome, playing, result
  const [playerData, setPlayerData] = useState({ name: 'Invitado', receipt: '0000' });
  const [result, setResult] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [attempts, setAttempts] = useState(0);

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
    setAttempts(prev => prev + 1);
    setGameState('playing');
  };

  const handleStop = async (finalScore) => {
    sounds.playGameResult('perfect'); 
    const gameResult = calculateBurgerMatchResult(finalScore);

    if (finalScore < 1) {
      setResult({ ...gameResult, coupon: null });
      setTimeout(() => setGameState('result'), 1000);
      return;
    }

    try {
      const apiHost = window.location.hostname === 'localhost' ? 'http://localhost:3001' : `http://${window.location.hostname}:3001`;
      const response = await fetch(`${apiHost}/api/claim-skill-prize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: "calza-burger",
          playerName: "Invitado",
          receipt: "0000",
          skillSuccessful: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "GANADOR") {
          setResult({
            ...gameResult,
            prize: data.label,
            coupon: data.couponCode
          });
        } else {
          // Forzar pérdida si no queda stock
          const forcedLose = calculateBurgerMatchResult(0);
          setResult({ ...forcedLose, coupon: null });
        }
      } else {
        throw new Error('API falló');
      }
    } catch (err) {
      console.warn("⚠️ Error en reclamo de premio central. Usando contingencia offline (Pérdida).", err.message);
      const forcedLose = calculateBurgerMatchResult(0);
      setResult({ ...forcedLose, coupon: null });
    }

    setTimeout(() => setGameState('result'), 1000);
  };

  const resetGame = () => {
    setPlayerData({ name: 'Invitado', receipt: '0000' });
    setGameState('welcome');
  };

  return (
    /* Contenedor principal con estética Cyber-Grill (Fondo texturizado volcánico de alta fidelidad) */
    <div className="h-screen w-full bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black select-none overflow-hidden flex flex-col font-sans p-4 relative">
      
      {/* Luces de Neón Ambientales de Fondo de Gabinete */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      {/* Botón Pantalla Completa */}
      <button 
        onPointerDown={toggleFullscreen}
        className="fixed top-6 right-6 z-[100] p-4 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white hover:border-white/20 active:scale-90 transition-all cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>

      {/* Header Cabecera Arcade de Alto Impacto */}
      <header className="text-center py-4 z-10 shrink-0">
        <h1 className="text-3xl font-black italic tracking-tighter flex items-center justify-center gap-2">
          <span className="text-white text-glow-cyan">RUTA</span>
          <span className="text-r9-red text-glow-red font-black">9</span> 
          <span className="font-light opacity-50 uppercase tracking-widest text-xs border-l border-white/20 pl-2.5 ml-1">
            Cyber-Grill Engine
          </span>
        </h1>
      </header>

      {/* Main Routing Area */}
      <main className="flex-1 flex flex-col justify-center items-center relative z-10 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* 1. WELCOME SCREEN (Pantalla de bienvenida interactiva de alta gama homologada) */}
          {gameState === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-[400px] flex flex-col items-center justify-center p-8 backdrop-blur-xl bg-slate-900/60 border-2 border-slate-800 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.05)] text-center space-y-8 animate-fade-in"
            >
              <div className="space-y-4">
                {/* Ícono animado de neón en gradiente de marca */}
                <div className="w-20 h-20 bg-gradient-to-br from-r9-red to-r9-gold border-2 border-r9-gold rounded-[2rem] mx-auto flex items-center justify-center shadow-[0_0_35px_rgba(255,184,0,0.4)]">
                  <Gamepad2 size={38} className="animate-pulse text-white" />
                </div>

                <h2 className="text-4xl font-black uppercase leading-none tracking-tight text-white flex flex-col gap-1">
                  <span>DESAFÍO</span>
                  <span className="text-r9-gold text-glow-amber">ARMA LA BURGER</span>
                </h2>
                
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                  La plancha de Ruta 9 está encendida. Memoriza la comanda del cliente y apila los ingredientes correctos de forma veloz para despachar hamburguesas perfectas.
                </p>
              </div>

              {/* Tarjeta de Instrucciones Glassmorphic */}
              <div className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left space-y-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <p className="text-[10px] font-black text-r9-gold uppercase tracking-widest text-glow-amber">💡 CÓMO JUGAR:</p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 font-semibold">
                  <li>Observa el orden exacto pedido por el cliente.</li>
                  <li>Toca los ingredientes de la grilla de abajo a arriba.</li>
                  <li>¡Completa 3 comandas para ganar el premio mayor!</li>
                </ul>
              </div>

              {/* Botón de Impacto Neón R9 */}
              <button 
                onPointerDown={handleStart}
                className="w-full py-5 sm:py-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest text-white
                  bg-gradient-to-r from-r9-red to-r9-gold border-2 border-r9-gold cursor-pointer transition-all duration-200
                  active:scale-95 shadow-[0_0_25px_rgba(255,184,0,0.5)] text-shadow-glow"
              >
                🎮 INICIAR COCCIÓN
              </button>
            </motion.div>
          )}

          {/* 2. PLAYING STAGE */}
          {gameState === 'playing' && (
            <motion.div 
              key="playing" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex-1 w-full flex flex-col overflow-hidden"
            >
              <BurgerMatcher onStop={handleStop} />
            </motion.div>
          )}

          {/* 3. RESULT SCREEN (Pantalla de premios y canje premium homologada) */}
          {gameState === 'result' && result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-[400px] flex flex-col items-center justify-center p-8 backdrop-blur-xl bg-slate-900/60 border-2 border-slate-800 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.05)] text-center space-y-8"
            >
              <div className="w-full space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-r9-red to-r9-gold border-2 border-r9-gold rounded-[2rem] mx-auto flex items-center justify-center shadow-[0_0_35px_rgba(255,184,0,0.45)]">
                  <Trophy size={38} className="text-white animate-bounce" />
                </div>

                <h3 className="text-r9-gold font-black uppercase tracking-[0.2em] text-xs text-glow-amber">RESULTADO DE COCINA</h3>
                <p className="text-3xl font-black uppercase leading-none tracking-tight text-white italic">{result.message}</p>
              </div>

              {/* Contenedor del Cupón con Estilo Ticket de Entrada */}
              <div className="w-full bg-slate-950/80 border-2 border-slate-900 rounded-3xl p-6 relative overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,184,0,0.05),transparent)] pointer-events-none" />
                <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] mb-2 font-black">CÓDIGO DE PREMIO</p>
                <p className="text-3xl font-black tracking-widest text-[#FFB800] font-mono text-glow-amber select-all">
                  {result.coupon || "SIN CÓDIGO"}
                </p>
                <div className="h-[1px] bg-slate-800 w-full my-4" />
                <p className="text-xl font-black text-white uppercase leading-none">{result.prize}</p>
                <p className="text-slate-400 text-[10px] mt-1.5 uppercase font-bold tracking-wider">{result.condition}</p>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-4 w-full">
                <button 
                  onPointerDown={resetGame}
                  className="w-full py-5 bg-[#C52026] text-white border border-[#C52026] rounded-2xl font-black flex items-center justify-center gap-3 uppercase text-sm active:scale-95 transition-all cursor-pointer shadow-[0_8px_20px_rgba(197,32,38,0.3)] hover:bg-[#C52026]/90"
                >
                  <RotateCcw size={16} /> NUEVA COMANDA
                </button>
                <button 
                  onPointerDown={() => window.parent.postMessage({ type: 'EXIT_GAME' }, '*')}
                  className="w-full py-5 bg-transparent text-white/20 border border-white/5 rounded-2xl font-black flex items-center justify-center gap-3 uppercase text-sm active:scale-95 transition-all cursor-pointer hover:text-white/40 hover:bg-white/5"
                >
                  VOLVER A MENÚ
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="text-center py-2 opacity-25 text-[8px] uppercase tracking-[0.4em] z-10 shrink-0">
        Ruta9 Precision Burger Engine v2.0
      </footer>
    </div>
  );
}

export default App;
