import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TriviaGame from './components/TriviaGame';
import { selectTriviaRound, calculateTriviaResult, generateCouponCode } from './utils/gameLogic';
import { Maximize, Minimize, RotateCcw, Trophy, Star, Award, ChevronRight } from 'lucide-react';
import { sounds } from './utils/sounds';

function App() {
  const [gameState, setGameState] = useState('welcome'); // welcome, playing, result
  const [roundQuestions, setRoundQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

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
    sounds.init();
    const round = selectTriviaRound();
    setRoundQuestions(round);
    setCorrectCount(0);
    setGameState('playing');
    sounds.startMusic();
  };

  const handleFinish = async (finalCorrect) => {
    setCorrectCount(finalCorrect);
    const gameResult = calculateTriviaResult(finalCorrect);
    sounds.stopMusic();

    if (finalCorrect < 3) {
      setResult({ ...gameResult, correctAnswers: finalCorrect, coupon: "" });
      sounds.playLose();
      setGameState('result');
      return;
    }

    try {
      const apiHost = window.location.hostname === 'localhost' ? 'http://localhost:3001' : `http://${window.location.hostname}:3001`;
      const response = await fetch(`${apiHost}/api/claim-skill-prize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: "ruta-millonaria",
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
            correctAnswers: finalCorrect,
            prize: data.label,
            coupon: data.couponCode
          });
          sounds.playWin();
        } else {
          // Forzar pérdida si no queda stock
          const forcedLose = calculateTriviaResult(0);
          setResult({ ...forcedLose, correctAnswers: finalCorrect, coupon: "" });
          sounds.playLose();
        }
      } else {
        throw new Error('API falló');
      }
    } catch (err) {
      console.warn("⚠️ Error en reclamo de premio central. Usando contingencia offline (Pérdida).", err.message);
      const forcedLose = calculateTriviaResult(0);
      setResult({ ...forcedLose, correctAnswers: finalCorrect, coupon: "" });
      sounds.playLose();
    }

    setGameState('result');
  };

  const resetGame = (e) => {
    if (e) e.preventDefault();
    if (!canInteract) return;
    setGameState('welcome');
  };

  const exitGame = (e) => {
    if (e) e.preventDefault();
    if (!canInteract) return;
    sounds.stopMusic();
    window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-r9-dark text-white font-display relative overflow-hidden gradient-mesh">
      <div className="noise-overlay" />

      {/* Botón de Pantalla Completa Estilo Tótem */}
      <button 
        onClick={toggleFullscreen}
        className="fixed top-8 right-8 z-[100] w-14 h-14 bg-white/5 border border-white/10 hover:border-[#FFB800]/30 hover:bg-[#FFB800]/10 rounded-2xl flex items-center justify-center text-white/30 hover:text-[#FFB800] active:scale-90 transition-all cursor-pointer shadow-lg backdrop-blur-md"
      >
        {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
      </button>

      <AnimatePresence mode="wait">
        {gameState === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10"
          >
            <div className="space-y-8 max-w-md">
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotateY: [0, 180, 360]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-36 h-36 bg-[#FFB800]/10 rounded-full mx-auto flex items-center justify-center border-2 border-[#FFB800]/30 shadow-[0_0_60px_rgba(255,184,0,0.2)]"
              >
                <Trophy size={68} className="text-[#FFB800] drop-shadow-[0_0_15px_rgba(255,184,0,0.5)]" fill="currentColor" />
              </motion.div>
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C52026]/10 border border-[#C52026]/30 rounded-full text-xs font-black text-[#C52026] uppercase tracking-[0.2em] shadow-lg">
                  🎰 Experiencia Arcade
                </div>
                <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
                  LA RUTA <br/> 
                  <span className="text-[#FFB800] text-glow-gold">MILLONARIA</span>
                </h1>
                <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed font-medium">
                  Demuestra cuánto sabes de la carta de <span className="text-white">Ruta 9</span> y desbloquea cupones de premio exclusivos en tiempo real.
                </p>
              </div>
            </div>

            <div className="w-full max-w-xs space-y-6 mt-12">
              <button 
                onPointerDown={handleStart}
                className={`group w-full py-5 sm:py-7 bg-[#C52026] hover:bg-[#C52026]/90 rounded-[2.5rem] font-black text-base sm:text-lg shadow-[0_10px_30px_rgba(197,32,38,0.4)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest cursor-pointer border border-[#C52026]/50 flex items-center justify-center gap-2 select-none touch-none ${!canInteract ? 'opacity-50' : ''}`}
              >
                COMENZAR DESAFÍO
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex justify-center gap-6 text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
                <span>⏱️ 15s por Pregunta</span>
                <span>•</span>
                <span>⚡ 2 Comodines</span>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col relative z-10">
            <TriviaGame questions={roundQuestions} onFinish={handleFinish} />
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10"
          >
            <div className="w-full max-w-sm glass-card rounded-[3.5rem] p-10 border border-white/10 relative overflow-hidden shadow-3xl">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C52026] via-[#FFB800] to-[#C52026]" />
              
              <div className="mb-6">
                <h3 className="text-[#FFB800] font-black uppercase tracking-[0.3em] text-[10px] mb-4 flex items-center justify-center gap-1">
                  <Award size={12} /> Desafío Completado
                </h3>
                <p className="text-4xl font-black uppercase italic leading-none text-white text-glow-white mb-4">
                  {result.levelName}
                </p>
                
                {/* Estrellas animadas de aciertos */}
                <div className="flex justify-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      className={`${i < correctCount ? 'text-[#FFB800] fill-[#FFB800] drop-shadow-[0_0_8px_rgba(255,184,0,0.5)]' : 'text-white/10'}`} 
                    />
                  ))}
                </div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{correctCount} de 5 correctas</p>
              </div>
              
              <div className="h-px bg-white/10 w-24 mx-auto my-6" />
              
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C52026]">Premio Obtenido</span>
                <p className="text-2xl font-black text-white uppercase">{result.prize}</p>
                <p className="text-white/40 text-[10px] italic max-w-[200px] mx-auto leading-relaxed">{result.condition}</p>
              </div>
              
              {result.score >= 50 && (
                <div className="mt-8 p-5 bg-black/60 border border-white/10 rounded-3xl relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-[#FFB800]/5 pointer-events-none" />
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] mb-2 font-black">Código de Canje</p>
                  <p className="text-2xl font-black tracking-widest text-[#FFB800] font-mono text-glow-gold select-all">{result.coupon}</p>
                  <p className="text-[8px] text-[#FFB800]/40 uppercase font-black mt-2 tracking-widest">Toma una foto a la pantalla</p>
                </div>
              )}
            </div>

            <div className="w-full max-w-xs space-y-4 mt-8">
              <button 
                onPointerDown={resetGame}
                className={`w-full py-5 sm:py-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest transition-all active:scale-95 bg-[#C52026] text-white border-2 border-[#C52026] shadow-[0_10px_25px_rgba(197,32,38,0.4)] cursor-pointer select-none touch-none ${!canInteract ? 'opacity-50' : 'hover:bg-[#C52026]/90'}`}
              >
                NUEVO DESAFÍO
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

      <footer className="text-center py-6 opacity-20 text-[8px] uppercase tracking-[0.6em] relative z-10 mt-auto font-black">
        Ruta 9 Millonaria Trivia Engine v2.0
      </footer>
    </div>
  );
}

export default App;
