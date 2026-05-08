import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplets } from 'lucide-react';
import { sounds } from '../utils/sounds';

export default function FireExperience({ onFinish }) {
  const [level, setLevel] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const requestRef = useRef();
  const levelRef = useRef(0);

  const growFire = () => {
    if (levelRef.current < 100) {
      levelRef.current += 0.45;
      setLevel(levelRef.current);
      sounds.updateFireIntensity(levelRef.current);
      requestRef.current = requestAnimationFrame(growFire);
    } else {
      handleRelease();
    }
  };

  const handlePress = () => {
    setIsPressing(true);
    sounds.startFireRoar();
    requestRef.current = requestAnimationFrame(growFire);
  };

  const handleRelease = () => {
    if (!isPressing) return;
    setIsPressing(false);
    cancelAnimationFrame(requestRef.current);
    sounds.playImpact();
    sounds.stopFireRoar();
    onFinish(levelRef.current);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative select-none touch-none">
      {/* Humo y Partículas */}
      <div className="absolute inset-0 smoke-gradient pointer-events-none" />
      
      {/* Burger Protagonista */}
      <div className="relative z-10 mb-20">
        <motion.div 
          animate={{ 
            scale: 1 + (level / 200),
            filter: `brightness(${1 + (level / 50)}) saturate(${1 + (level / 100)})`,
          }}
          className="relative transition-all duration-300"
        >
          {/* Gráfico de Burger Premium Simulado */}
          <div className="w-64 h-64 rounded-full bg-r9-charcoal border-8 border-white/5 flex items-center justify-center relative overflow-hidden ember-glow">
              <div className="absolute inset-0 bg-gradient-to-t from-r9-red/20 to-transparent" />
              <div className="w-48 h-48 bg-white/5 rounded-full flex items-center justify-center">
                  <BoxIcon level={level} />
              </div>
          </div>

          {/* Resplandor de Fuego Detrás */}
          <motion.div 
            animate={{ 
                opacity: level / 100,
                scale: 1 + (level / 100)
            }}
            className="absolute inset-0 bg-r9-orange/30 blur-[100px] rounded-full -z-10"
          />
        </motion.div>

        {/* Humo Animado */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-64 overflow-hidden pointer-events-none opacity-20">
           <motion.div 
             animate={{ y: [-10, -100], opacity: [0, 1, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="w-full h-full bg-gradient-to-t from-white/20 to-transparent blur-3xl rounded-full"
           />
        </div>
      </div>

      {/* Instrucciones y Medidor */}
      <div className="relative z-20 w-full max-w-xs space-y-12">
        <div className="text-center">
            <AnimatePresence mode="wait">
                {!isPressing && level === 0 ? (
                    <motion.p 
                        key="instr"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-white/40 uppercase tracking-[0.3em] text-xs font-black"
                    >
                        Mantén presionado para encender
                    </motion.p>
                ) : (
                    <motion.p 
                        key="target"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-r9-gold uppercase tracking-[0.3em] text-xs font-black animate-pulse"
                    >
                        Suelta en el punto ruta9
                    </motion.p>
                )}
            </AnimatePresence>
        </div>

        {/* Medidor Estilo Cinematic */}
        <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-r9-red via-r9-orange to-r9-gold"
                style={{ width: `${level}%` }}
            />
            {/* Target Marker (Punto 70) */}
            <div className="absolute left-[70%] top-0 h-full w-1 bg-white shadow-[0_0_10px_white] z-20">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-white whitespace-nowrap tracking-widest opacity-50">70%</div>
            </div>
        </div>

        {/* Área Táctil Principal */}
        <button
            onPointerDown={handlePress}
            onPointerUp={handleRelease}
            onPointerCancel={handleRelease}
            className={`w-full py-10 rounded-[40px] border-2 transition-all duration-500 flex flex-col items-center justify-center gap-2
                ${isPressing ? 'bg-white/10 border-white/40 scale-95' : 'bg-r9-dark border-white/5'}
            `}
        >
            <div className={`p-4 rounded-full transition-colors ${isPressing ? 'bg-r9-red text-white' : 'bg-white/5 text-white/20'}`}>
                <Flame size={32} fill={isPressing ? "currentColor" : "none"} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isPressing ? 'text-white' : 'text-white/20'}`}>
                {isPressing ? 'CALENTANDO...' : 'PRESIONAR'}
            </span>
        </button>
      </div>
    </div>
  );
}

function BoxIcon({ level }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-24 h-24 text-white/20">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    )
}
