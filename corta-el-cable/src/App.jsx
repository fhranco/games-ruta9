import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from './utils/sounds';
import { Clock, RefreshCcw, ShieldAlert, Award, Maximize, Minimize } from 'lucide-react';

const COLORS = [
  { id: 'red', name: 'Rojo', hex: '#EF4444', glow: 'rgba(239, 68, 68, 0.6)' },
  { id: 'blue', name: 'Azul', hex: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)' },
  { id: 'yellow', name: 'Amarillo', hex: '#EAB308', glow: 'rgba(234, 179, 8, 0.6)' }
];

export default function App() {
  const [gameState, setGameState] = useState('welcome'); // welcome, playing, explosion, result
  const [timeLeft, setTimeLeft] = useState(15.00); // 15.00 segundos con decimales
  const [score, setScore] = useState(0);
  const [targetColor, setTargetColor] = useState(null);
  const [wires, setWires] = useState([]);
  const [flash, setFlash] = useState(null); // 'success', 'error'
  const [explosionType, setExplosionType] = useState(''); // 'ketchup', 'mustard', 'bbq'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [result, setResult] = useState(null);

  const gameTimerRef = useRef(null);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(gameTimerRef.current);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Mezclar baraja de cables
  const scrambleWires = () => {
    const deck = [...COLORS];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setWires(deck);

    // Asignar color objetivo al azar
    const target = deck[Math.floor(Math.random() * deck.length)];
    setTargetColor(target);
  };

  // Iniciar Juego
  const startGame = () => {
    setScore(0);
    setTimeLeft(15.00);
    setFlash(null);
    scrambleWires();
    setGameState('playing');
    sounds.playTap();
    
    // Anunciar inicio
    sounds.announce("¡Corta los cables indicados antes de que la cocina estalle!");

    // Intervalo de alta precisión (cada 50ms resta 0.05 segundos)
    clearInterval(gameTimerRef.current);
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.05) {
          clearInterval(gameTimerRef.current);
          triggerExplosion();
          return 0;
        }
        return Number((prev - 0.05).toFixed(2));
      });
    }, 50);
  };

  // Manejar el manotazo/corte del cable
  const handleWireCut = (colorId) => {
    if (gameState !== 'playing' || flash) return;

    if (colorId === targetColor.id) {
      // ¡Corte Perfecto!
      sounds.playMatch();
      setFlash('success');
      setScore(prev => prev + 1);

      // Inyectar +1.5 segundos de bonus (con un tope máximo de 15 segundos)
      setTimeLeft(prev => Math.min(15.00, Number((prev + 1.5).toFixed(2))));

      // Cambiar y reordenar cables rápido
      setTimeout(() => {
        setFlash(null);
        scrambleWires();
      }, 200);
    } else {
      // Error de cable
      sounds.playLose();
      setFlash('error');
      
      // Quitar -3.0 segundos de penalización
      setTimeLeft(prev => Math.max(0, Number((prev - 3.0).toFixed(2))));

      setTimeout(() => {
        setFlash(null);
      }, 400);
    }
  };

  // Detonación / Fin por tiempo
  const triggerExplosion = () => {
    clearInterval(gameTimerRef.current);
    sounds.playLose();
    setGameState('explosion');

    // Asignar un tipo de salpicadura humorística al azar
    const splats = ['ketchup', 'mustard', 'bbq'];
    setExplosionType(splats[Math.floor(Math.random() * splats.length)]);

    // Calcular el premio final según circuitos desactivados
    let finalPrize = {};
    if (score >= 15) {
      finalPrize = {
        level: 'perfect',
        message: "¡Héroe de Ruta 9!",
        prize: "3 cupones de sorteo por promo burger por 2",
        condition: "Muestra este código en caja"
      };
    } else if (score >= 10) {
      finalPrize = {
        level: 'excellent',
        message: "¡Súper Reflejos!",
        prize: "Papas gratis",
        condition: "Solo en caja con tu consumo"
      };
    } else if (score >= 5) {
      finalPrize = {
        level: 'good',
        message: "¡Buen Intento!",
        prize: "Salsa gratis",
        condition: "Comprando tu burger"
      };
    } else {
      finalPrize = {
        level: 'try-again',
        message: "¡BOOM! Explotaste",
        prize: "Sigue participando",
        condition: "¡La cocina se llenó de salsa!"
      };
    }
    setResult(finalPrize);

    // Reproducir locución de resultado final tras la comedia
    setTimeout(() => {
      sounds.playGameResult(finalPrize.level);
      setGameState('result');
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col p-4 bg-[#0D0D12] text-white font-body relative overflow-hidden select-none">
      
      {/* Botón de pantalla completa */}
      <button 
        onPointerDown={toggleFullscreen}
        className="fixed top-6 right-6 z-[100] p-4 bg-white/5 border border-white/10 rounded-full text-white/20 active:scale-90 cursor-pointer"
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      {/* Header */}
      <header className="text-center py-6 relative z-10">
        <h1 className="text-3xl font-black italic tracking-tighter flex items-center justify-center gap-2">
          RUTA<span className="text-r9-red">9</span> <span className="font-light opacity-50 uppercase tracking-widest text-sm">CORTA EL CABLE</span>
        </h1>
      </header>

      {/* Main viewport */}
      <main className="flex-1 flex flex-col justify-center relative z-10 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {/* 🎬 1. Pantalla de Bienvenida */}
          {gameState === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-12 px-6"
            >
              <div className="space-y-6">
                <div className="w-24 h-24 bg-r9-red rounded-full mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(227,28,45,0.4)] animate-pulse">
                    <ShieldAlert size={48} className="text-white" />
                </div>
                <h2 className="text-5xl font-black uppercase leading-none tracking-tighter">
                  ¡BOMBA DE TIEMPO! <br/> <span className="text-r9-gold">CORTA EL CABLE</span>
                </h2>
                <p className="text-white/45 text-base leading-relaxed">
                  El circuito de la cocina se ha sobrecalentado. Corta rápidamente el cable del color que te indica el operador antes de que todo estalle. ¡Cada acierto te suma +1.5 segundos!
                </p>
              </div>
              <button 
                onPointerDown={startGame}
                className="w-full py-8 bg-r9-red hover:bg-red-500 rounded-3xl font-black text-2xl shadow-[0_12px_0_0_#9B141E] active:translate-y-2 active:shadow-none transition-all uppercase cursor-pointer"
              >
                DESACTIVAR BOMBA 💣
              </button>
            </motion.div>
          )}

          {/* 🎮 2. Pantalla de Juego */}
          {gameState === 'playing' && (
            <motion.div 
              key="playing" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex-1 flex flex-col justify-between h-full py-4 relative"
            >
              {/* Reloj LED Rojo Retro y Marcador */}
              <div className="flex justify-between items-center px-2 mb-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/30 tracking-widest uppercase">CIRCUITOS DESACTIVADOS</span>
                  <span className="text-3xl font-black italic tracking-tighter text-r9-gold text-glow-gold">{score}</span>
                </div>

                {/* Reloj LED 7-Segmentos */}
                <div className={`px-5 py-2.5 rounded-2xl border flex flex-col items-end shadow-2xl transition-all duration-200
                  ${timeLeft <= 4.0 ? 'bg-red-500/20 border-r9-red animate-pulse' : 'bg-[#1E293B]/30 border-white/10'}
                `}>
                  <span className={`text-[8px] font-black tracking-widest uppercase flex items-center gap-1 ${timeLeft <= 4.0 ? 'text-r9-red animate-bounce' : 'text-white/30'}`}>
                    <Clock size={8} /> BOMBA ACTIVA
                  </span>
                  <span className={`text-3xl font-mono font-black tracking-widest ${timeLeft <= 4.0 ? 'text-r9-red text-glow-red' : 'text-r9-gold text-glow-gold'}`}>
                    {timeLeft.toFixed(2)}s
                  </span>
                </div>
              </div>

              {/* Pantalla del Circuito Interno */}
              <div className={`flex-1 w-full bg-[#1E293B]/20 border-4 border-white/5 rounded-[2.5rem] p-6 flex flex-col justify-between items-center relative overflow-hidden transition-all duration-200
                ${flash === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' : ''}
                ${flash === 'error' ? 'bg-red-500/25 border-r9-red animate-shake' : ''}
              `}>
                
                {/* Indicador Luminoso de la Orden */}
                <div className="w-full text-center">
                  <span className="text-[9px] font-black text-r9-gold tracking-[0.4em] uppercase">ORDEN DE CIRCUITO</span>
                  <div className="mt-2 py-3 bg-[#0D0D12] border border-white/5 rounded-2xl flex items-center justify-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full animate-ping" style={{ backgroundColor: targetColor?.hex }} />
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                      ¡CORTA EL <span style={{ color: targetColor?.hex }}>{targetColor?.name}</span>!
                    </h3>
                  </div>
                </div>

                {/* Los 3 Cables Verticales Interactivos */}
                <div className="w-full flex justify-around items-stretch h-56 my-6 relative z-10 px-4">
                  {wires.map((wire) => (
                    <button
                      key={wire.id}
                      onPointerDown={() => handleWireCut(wire.id)}
                      className="group relative flex flex-col items-center justify-center w-14 rounded-full overflow-hidden transition-transform duration-100 hover:scale-105 active:scale-95 cursor-pointer"
                      style={{
                        background: `linear-gradient(90deg, #1A1A24 0%, ${wire.hex} 40%, #FFF 50%, ${wire.hex} 60%, #1A1A24 100%)`,
                        boxShadow: `0 0 25px ${wire.glow}`
                      }}
                    >
                      {/* Sutil núcleo de cobre interno del cable */}
                      <div className="w-1.5 h-full bg-yellow-600/30 blur-[0.5px]" />
                      
                      {/* Letra identificadora vertical para ayudar */}
                      <span className="absolute text-xl font-black text-white/40 group-hover:text-white transition-colors rotate-90 leading-none">
                        {wire.name[0]}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-[8px] font-black text-white/20 tracking-widest uppercase">
                  TOCA EL CABLE CORRECTO DE INMEDIATO
                </p>
              </div>

            </motion.div>
          )}

          {/* 💥 3. Pantalla de Explosión Cómica de Salsa */}
          {gameState === 'explosion' && (
            <motion.div 
              key="explosion"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black"
            >
              {/* Salpicadura de Ketchup */}
              {explosionType === 'ketchup' && (
                <div className="absolute inset-0 bg-[#C52026]/90 flex flex-col items-center justify-center p-6 text-center select-none animate-pulse">
                  <div className="text-8xl filter drop-shadow-2xl">🍅💥💦</div>
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white mt-8 leading-none animate-bounce">
                    ¡BOOOOM!
                  </h2>
                  <p className="text-sm font-black text-white/50 uppercase tracking-[0.3em] mt-4">
                    ¡TE LLENASTE DE KÉTCHUP!
                  </p>
                </div>
              )}

              {/* Salpicadura de Mostaza */}
              {explosionType === 'mustard' && (
                <div className="absolute inset-0 bg-[#EAB308]/95 flex flex-col items-center justify-center p-6 text-center select-none animate-pulse">
                  <div className="text-8xl filter drop-shadow-2xl">🍋💥💦</div>
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter text-black mt-8 leading-none animate-bounce">
                    ¡BOOOOM!
                  </h2>
                  <p className="text-sm font-black text-black/50 uppercase tracking-[0.3em] mt-4">
                    ¡EXPLOSIÓN DE MOSTAZA!
                  </p>
                </div>
              )}

              {/* Salpicadura de BBQ */}
              {explosionType === 'bbq' && (
                <div className="absolute inset-0 bg-[#4A1E05]/95 flex flex-col items-center justify-center p-6 text-center select-none animate-pulse">
                  <div className="text-8xl filter drop-shadow-2xl">🍖💥💦</div>
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter text-glow-gold text-[#FFB800] mt-8 leading-none animate-bounce">
                    ¡BOOOOM!
                  </h2>
                  <p className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mt-4">
                    ¡CUBIERTO DE SALSA BARBACOA!
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* 🏆 4. Pantalla de Resultados y Premio */}
          {gameState === 'result' && result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8 py-6"
            >
              <div className="p-10 bg-[#1E293B]/20 rounded-[40px] border-4 border-r9-gold shadow-[0_0_60px_rgba(255,184,0,0.15)] relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-28 h-28 bg-r9-gold/5 rounded-full blur-xl pointer-events-none" />
                
                <h3 className="text-r9-gold font-black uppercase tracking-[0.3em] text-xs mb-6 flex items-center justify-center gap-1.5">
                  <Award size={12} /> Desactivaciones con Éxito
                </h3>
                
                <p className="text-6xl font-black text-white mb-2 leading-none italic tracking-tight uppercase">
                  {score} Cables
                </p>
                <p className="text-white/45 font-bold uppercase text-[9px] tracking-widest">
                  {result.message}
                </p>
                
                <div className="h-px bg-white/10 w-24 mx-auto my-8" />
                
                <p className="text-2xl font-black text-[#FFB800] uppercase mb-1 leading-tight tracking-tight">
                  {result.prize}
                </p>
                <p className="text-white/40 text-xs italic">
                  {result.condition}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <button 
                  onPointerDown={startGame}
                  className="w-full py-6 bg-white/5 border-2 border-white/10 rounded-3xl font-black flex items-center justify-center gap-4 uppercase text-xl hover:bg-white/10 active:scale-95 transition-all select-none cursor-pointer"
                >
                  <RefreshCcw size={24} /> NUEVA DESACTIVACIÓN
                </button>
                <button 
                  onPointerDown={() => window.parent.postMessage({ type: 'EXIT_GAME' }, '*')}
                  className="w-full py-6 bg-r9-red border-2 border-r9-red rounded-3xl font-black flex items-center justify-center gap-4 uppercase text-xl shadow-[0_6px_0_0_#9B141E] hover:bg-red-500 active:translate-y-1 active:shadow-none active:scale-95 transition-all select-none cursor-pointer"
                >
                  VOLVER A MENÚ
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="text-center p-6 opacity-20 text-[10px] uppercase tracking-[0.5em] relative z-10">
        Ruta9 Precision Bomb Defusal Engine v2.0
      </footer>
    </div>
  );
}
