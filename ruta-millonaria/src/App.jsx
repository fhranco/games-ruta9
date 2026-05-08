import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TriviaGame from './components/TriviaGame';
import { selectTriviaRound, calculateTriviaResult, generateCouponCode } from './utils/gameLogic';
import { Maximize, Minimize, RotateCcw, Trophy, BookOpen } from 'lucide-react';
import { sounds } from './utils/sounds';

function App() {
  const [gameState, setGameState] = useState('welcome'); // welcome, form, playing, result
  const [playerData, setPlayerData] = useState({ name: '', receipt: '' });
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

  const handleStart = () => {
    sounds.init();
    setGameState('form');
  };

  const startTrivia = () => {
    const round = selectTriviaRound();
    setRoundQuestions(round);
    setCorrectCount(0);
    setGameState('playing');
    sounds.startMusic();
  };

  const handleFinish = (finalCorrect) => {
    setCorrectCount(finalCorrect);
    const gameResult = calculateTriviaResult(finalCorrect);
    const coupon = generateCouponCode(gameResult.couponPrefix);
    setResult({ ...gameResult, correctAnswers: finalCorrect, coupon });
    sounds.stopMusic();
    
    setTimeout(() => {
      setGameState('result');
    }, 1000);
  };

  const resetGame = () => {
    setPlayerData({ name: '', receipt: '' });
    setGameState('welcome');
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
        {gameState === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12"
          >
            <div className="space-y-6">
              <motion.div 
                animate={{ scale: [1, 1.05, 1], rotateY: [0, 180, 360] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="w-32 h-32 bg-r9-gold/10 rounded-full mx-auto flex items-center justify-center border-2 border-r9-gold/20 shadow-[0_0_60px_rgba(255,184,0,0.2)]"
              >
                <Trophy size={64} className="text-r9-gold" fill="currentColor" />
              </motion.div>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                LA RUTA <br/> <span className="text-r9-gold">MILLONARIA</span>
              </h1>
              <p className="text-white/40 text-lg max-w-xs mx-auto">Demuestra cuánto sabes de la carta Ruta9 y gana beneficios exclusivos.</p>
            </div>

            <div className="w-full max-w-xs space-y-4">
                <button 
                    onClick={handleStart}
                    className="w-full py-8 bg-r9-red rounded-[40px] font-black text-xl shadow-[0_12px_0_0_#9B141E] active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest"
                >
                    COMENZAR TRIVIA
                </button>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">5 Preguntas • 15 Segundos • 2 Comodines</p>
            </div>
          </motion.div>
        )}

        {gameState === 'form' && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}
            className="flex-1 flex flex-col items-center justify-center p-8 space-y-8"
          >
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white/20 mb-4 border border-white/5">
                <BookOpen size={40} />
            </div>
            <h3 className="text-4xl font-black uppercase italic">Identifícate</h3>
            <div className="w-full max-w-xs space-y-6">
                <input 
                  type="text" 
                  placeholder="Tu Nombre"
                  className="w-full bg-r9-charcoal border-2 border-white/5 rounded-3xl p-6 text-xl outline-none focus:border-r9-red transition-all"
                  value={playerData.name}
                  onChange={(e) => setPlayerData({...playerData, name: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="N° de Boleta"
                  className="w-full bg-r9-charcoal border-2 border-white/5 rounded-3xl p-6 text-xl outline-none focus:border-r9-red transition-all"
                  value={playerData.receipt}
                  onChange={(e) => setPlayerData({...playerData, receipt: e.target.value})}
                />
                <button 
                  onClick={startTrivia}
                  disabled={!playerData.name || !playerData.receipt}
                  className="w-full py-8 bg-white text-r9-dark rounded-[40px] font-black text-2xl uppercase disabled:opacity-50 tracking-tighter"
                >
                  ¡ACEPTO EL DESAFÍO!
                </button>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
            <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                <TriviaGame questions={roundQuestions} onFinish={handleFinish} />
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
                <h3 className="text-r9-gold font-black uppercase tracking-[0.4em] text-[10px] mb-8">Nivel Alcanzado</h3>
                <p className="text-4xl font-black uppercase mb-4 leading-none italic">{result.levelName}</p>
                <div className="flex justify-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i < correctCount ? 'bg-r9-gold' : 'bg-white/10'}`} />
                    ))}
                </div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{correctCount} de 5 correctas</p>
                
                <div className="h-px bg-white/10 w-24 mx-auto my-10" />
                
                <p className="text-2xl font-black text-white uppercase mb-2">{result.prize}</p>
                <p className="text-white/40 text-[10px] italic max-w-[180px] mx-auto leading-relaxed">{result.condition}</p>
                
                {result.score > 10 && (
                    <div className="mt-10 p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-2">Tu Cupón</p>
                        <p className="text-xl font-black tracking-tighter text-r9-gold">{result.coupon}</p>
                    </div>
                )}
              </div>

              <button 
                onClick={resetGame}
                className="w-full max-w-xs py-6 bg-white/5 border-2 border-white/10 rounded-3xl font-black flex items-center justify-center gap-4 hover:bg-white/10 transition-all uppercase text-lg"
              >
                <RotateCcw size={20} /> JUGAR OTRA VEZ
              </button>
            </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center p-8 opacity-20 text-[8px] uppercase tracking-[0.6em]">
        Ruta9 Millonaria Trivia Engine v1.0
      </footer>
    </div>
  );
}

export default App;
