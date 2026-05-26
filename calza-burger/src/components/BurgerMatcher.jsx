import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../utils/sounds';

// Partículas de chispas doradas y rojas al detener la hamburguesa
const Sparks = () => {
  const particles = Array.from({ length: 16 });
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      {particles.map((_, i) => {
        const angle = (i * 360) / 16;
        const distance = 90 + Math.random() * 70;
        const size = 5 + Math.random() * 8;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.3, 0],
              x: Math.cos((angle * Math.PI) / 180) * distance,
              y: Math.sin((angle * Math.PI) / 180) * distance,
              opacity: [1, 0.8, 0],
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 0.75,
              ease: "easeOut"
            }}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: i % 2 === 0 ? '#FFB800' : '#D1232B',
              boxShadow: i % 2 === 0 ? '0 0 10px rgba(255, 184, 0, 0.8)' : '0 0 10px rgba(209, 35, 43, 0.8)'
            }}
          />
        );
      })}
    </div>
  );
};

// Componente visual de la hamburguesa de alta fidelidad con capas enriquecidas por CSS
const BurgerGraphic = ({ isShadow = false }) => {
  if (isShadow) {
    return (
      <div className="relative flex flex-col items-center justify-center w-52 h-44 opacity-25 pointer-events-none scale-105">
        {/* Ghost outline Bun */}
        <div className="w-40 h-16 rounded-t-[100px] rounded-b-[10px] border-[3px] border-dashed border-white bg-transparent" />
        {/* Ghost outline Sauce */}
        <div className="w-[166px] h-2.5 border-b-[3px] border-dashed border-white bg-transparent -mt-2.5" />
        {/* Ghost outline Lettuce */}
        <div className="w-[174px] h-3 border-b-[3px] border-dashed border-white bg-transparent -mt-1" />
        {/* Ghost outline Cheese */}
        <div className="w-[172px] h-2.5 border-[3px] border-dashed border-white bg-transparent -mt-1.5" />
        {/* Ghost outline Patty */}
        <div className="w-[166px] h-12 rounded-[16px] border-[3px] border-dashed border-white bg-transparent -mt-1.5" />
        {/* Ghost outline Base */}
        <div className="w-40 h-10 rounded-b-[24px] rounded-t-[6px] border-[3px] border-dashed border-white bg-transparent -mt-1.5" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-52 h-44 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] select-none pointer-events-none">
      {/* 🍔 Pan Superior (Golden Bun) */}
      <div className="relative w-40 h-16 rounded-t-[100px] rounded-b-[10px] bg-gradient-to-b from-[#FFA733] via-[#D68D3E] to-[#B3681B] shadow-[inset_0_8px_10px_rgba(255,255,255,0.35),inset_0_-5px_8px_rgba(0,0,0,0.3)] z-50">
        
        {/* Brillo 3D en la parte superior */}
        <div className="absolute top-1.5 left-6 right-6 h-3 bg-white/20 rounded-full blur-[1px]" />
        
        {/* Semillas de Sésamo Detalladas */}
        <div className="absolute top-3 left-[18%] w-1.5 h-3 bg-[#FFE6A3] rounded-[40%] rotate-[25deg] opacity-95 shadow-[1px_1px_1px_rgba(0,0,0,0.2)]" />
        <div className="absolute top-5 left-[32%] w-1.5 h-3 bg-[#FFE6A3] rounded-[40%] rotate-[-15deg] opacity-95 shadow-[1px_1px_1px_rgba(0,0,0,0.2)]" />
        <div className="absolute top-2 left-[50%] w-1.5 h-3 bg-[#FFE6A3] rounded-[40%] rotate-[10deg] opacity-95 shadow-[1px_1px_1px_rgba(0,0,0,0.2)]" />
        <div className="absolute top-4 left-[68%] w-1.5 h-3 bg-[#FFE6A3] rounded-[40%] rotate-[-30deg] opacity-95 shadow-[1px_1px_1px_rgba(0,0,0,0.2)]" />
        <div className="absolute top-3 left-[82%] w-1.5 h-3 bg-[#FFE6A3] rounded-[40%] rotate-[40deg] opacity-95 shadow-[1px_1px_1px_rgba(0,0,0,0.2)]" />
        <div className="absolute top-8 left-[24%] w-1.5 h-3 bg-[#FFE6A3] rounded-[40%] rotate-[5deg] opacity-95 shadow-[1px_1px_1px_rgba(0,0,0,0.2)]" />
        <div className="absolute top-7 left-[45%] w-1.5 h-3 bg-[#FFE6A3] rounded-[40%] rotate-[-20deg] opacity-95 shadow-[1px_1px_1px_rgba(0,0,0,0.2)]" />
        <div className="absolute top-8 left-[60%] w-1.5 h-3 bg-[#FFE6A3] rounded-[40%] rotate-[15deg] opacity-95 shadow-[1px_1px_1px_rgba(0,0,0,0.2)]" />
        <div className="absolute top-9 left-[76%] w-1.5 h-3 bg-[#FFE6A3] rounded-[40%] rotate-[-10deg] opacity-95 shadow-[1px_1px_1px_rgba(0,0,0,0.2)]" />
      </div>

      {/* 🥫 Salsa Especial Ruta 9 */}
      <div className="relative w-[166px] h-3 bg-gradient-to-b from-[#D1232B] to-[#991118] rounded-full -mt-2.5 z-40 shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        {/* Gotas Colgantes */}
        <div className="absolute top-1 left-[20%] w-3.5 h-5 bg-[#991118] rounded-b-full shadow-[0_2px_2px_rgba(0,0,0,0.25)]" />
        <div className="absolute top-1 left-[52%] w-3 h-4 bg-[#D1232B] rounded-b-full shadow-[0_2px_2px_rgba(0,0,0,0.2)]" />
        <div className="absolute top-1 left-[78%] w-3.5 h-6 bg-[#991118] rounded-b-full shadow-[0_2px_2px_rgba(0,0,0,0.25)]" />
      </div>

      {/* 🥬 Lechuga Fresca */}
      <div className="relative w-[174px] h-4 bg-gradient-to-r from-[#4E7A27] via-[#60993E] to-[#4E7A27] rounded-full -mt-1 z-30 flex justify-between px-1.5 shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
        {/* Ripples / Ondas realistas de lechuga */}
        <div className="w-5.5 h-6 bg-[#60993E] rounded-full -mt-2.5 border-b-2 border-black/10" />
        <div className="w-6 h-5 bg-[#4E7A27] rounded-full -mt-1.5" />
        <div className="w-7.5 h-6 bg-[#60993E] rounded-full -mt-2 border-b-2 border-black/10" />
        <div className="w-5 h-5.5 bg-[#4E7A27] rounded-full -mt-1" />
        <div className="w-7 h-6 bg-[#60993E] rounded-full -mt-2.5 border-b-2 border-black/10" />
        <div className="w-6 h-5 bg-[#4E7A27] rounded-full -mt-1" />
        <div className="w-6 h-6 bg-[#60993E] rounded-full -mt-2 border-b-2 border-black/10" />
      </div>

      {/* 🍅 Tomate Fresco */}
      <div className="relative w-[164px] h-3 -mt-1.5 z-20 flex justify-around px-2">
        {/* Rodaja 1 */}
        <div className="w-16 h-4.5 bg-gradient-to-b from-[#E63946] to-[#C32F3C] rounded-full border-t border-white/20 flex justify-center items-center shadow-[0_2.5px_3px_rgba(0,0,0,0.2)]">
          <div className="w-[85%] h-[60%] bg-[#A8202A] rounded-full flex justify-around items-center">
            <div className="w-1 h-1 bg-[#FBBF24] rounded-full opacity-80" />
            <div className="w-1 h-1 bg-[#FBBF24] rounded-full opacity-80" />
          </div>
        </div>
        {/* Rodaja 2 */}
        <div className="w-16 h-4.5 bg-gradient-to-b from-[#E63946] to-[#C32F3C] rounded-full border-t border-white/20 flex justify-center items-center shadow-[0_2.5px_3px_rgba(0,0,0,0.2)]">
          <div className="w-[85%] h-[60%] bg-[#A8202A] rounded-full flex justify-around items-center">
            <div className="w-1 h-1 bg-[#FBBF24] rounded-full opacity-80" />
            <div className="w-1 h-1 bg-[#FBBF24] rounded-full opacity-80" />
          </div>
        </div>
      </div>

      {/* 🧀 Queso Cheddar Derretido */}
      <div className="relative w-[172px] h-2.5 bg-[#FFB800] rounded-full -mt-2 z-10 shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
        {/* Esquinas derretidas que fluyen sobre la carne */}
        <div className="absolute top-1 left-[14%] w-6.5 h-6.5 bg-[#FFB800] rounded-b-lg skew-x-[-15deg] shadow-[1px_2px_3px_rgba(0,0,0,0.2)]" />
        <div className="absolute top-1 right-[18%] w-7 h-8 bg-[#FFB800] rounded-b-xl skew-x-[12deg] shadow-[-1px_2px_3px_rgba(0,0,0,0.2)]" />
      </div>

      {/* 🥩 Carne Parrillera Flame-grilled */}
      <div className="relative w-[166px] h-12 bg-gradient-to-b from-[#4A1E05] via-[#2F1000] to-[#1C0800] rounded-[16px] -mt-2 z-0 shadow-[inset_0_4px_6px_rgba(0,0,0,0.65),0_4px_8px_rgba(0,0,0,0.45)] overflow-hidden flex items-center justify-around">
        {/* Marcas de Parrilla Cruzadas */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(0,0,0,0.4)_50%,transparent_55%)] bg-[length:24px_24px] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_46%,rgba(0,0,0,0.25)_50%,transparent_54%)] bg-[length:24px_24px] opacity-50" />
        
        {/* Textura / Pimienta negra */}
        <div className="w-1 h-8 bg-black/50 rotate-[35deg] rounded-full opacity-60" />
        <div className="w-1.5 h-6 bg-black/50 rotate-[35deg] rounded-full opacity-50" />
        <div className="w-1 h-9 bg-black/50 rotate-[35deg] rounded-full opacity-60" />
        <div className="w-1.5 h-7 bg-black/50 rotate-[35deg] rounded-full opacity-50" />
      </div>

      {/* 🍞 Pan Inferior (Toasted Base) */}
      <div className="w-40 h-10 bg-gradient-to-b from-[#C47D30] to-[#914F13] rounded-b-[24px] rounded-t-[6px] -mt-2.5 shadow-[inset_0_3px_5px_rgba(255,255,255,0.2),inset_0_-4px_6px_rgba(0,0,0,0.55),0_6px_12px_rgba(0,0,0,0.45)] z-[2]" />
    </div>
  );
};

export default function BurgerMatcher({ onStop, attempts = 0 }) {
  const [position, setPosition] = useState(0);
  const [isMoving, setIsMoving] = useState(true);
  const requestRef = useRef();
  const directionRef = useRef(1);
  const frameRef = useRef(0);
  const isRunningRef = useRef(true); // Guardia de toque síncrona contra rebotes de pantalla táctil

  // Dificultad Progresiva Extrema: Aumentamos drásticamente la velocidad base
  const baseMinSpeed = 6.0 + attempts * 1.8; // Comienza súper rápido (6.0% por frame) y escala hasta 13.2%
  const baseMaxRange = 3.5 + attempts * 1.0; // Rango de dispersión para imprevisibilidad

  // Velocidad inicial
  const currentSpeedRef = useRef(baseMinSpeed + Math.random() * baseMaxRange);
  const lastTimeRef = useRef(0);

  const animate = (now) => {
    if (!isRunningRef.current) return;

    if (!lastTimeRef.current) {
      lastTimeRef.current = now;
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const deltaMs = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Normalizar a 60 FPS (16.666ms por frame).
    const delta = Math.min(3.0, deltaMs / 16.666);

    frameRef.current += 1;
    setPosition((prev) => {
      // Fluctuación de velocidad senoidal fluida con ondas más rápidas y marcadas
      const speedFluctuation = Math.sin(frameRef.current * 0.08) * (1.5 + attempts * 0.4);
      const stepSpeed = Math.max(3.5, currentSpeedRef.current + speedFluctuation);
      
      let next = prev + directionRef.current * stepSpeed * delta;
      
      if (next >= 100) {
        directionRef.current = -1;
        // Asignar nueva velocidad aleatoria escalada por la dificultad del intento
        currentSpeedRef.current = baseMinSpeed + Math.random() * baseMaxRange;
        sounds.playTap(); // Sonido de rebote elástico
        return 100;
      }
      if (next <= 0) {
        directionRef.current = 1;
        currentSpeedRef.current = baseMinSpeed + Math.random() * baseMaxRange;
        sounds.playTap(); // Sonido de rebote elástico
        return 0;
      }
      return next;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleStop = () => {
    if (!isRunningRef.current || !isMoving) return;
    isRunningRef.current = false; // Bloqueo síncrono instantáneo
    setIsMoving(false);
    cancelAnimationFrame(requestRef.current);
    onStop(position);
  };

  return (
    <div className="flex flex-col items-center justify-between h-[60vh] py-8 px-4 relative select-none">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Detén la Burger</h2>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.25em]">Cálzala justo en el centro</p>
      </div>

      <div 
        onClick={handleStop}
        className={`relative w-full h-80 flex items-center justify-center cursor-none ${isMoving ? 'active:scale-95' : ''} transition-transform duration-150`}
      >
        {/* Silueta / Sombra Fija al Centro Exacto */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="relative">
            <BurgerGraphic isShadow={true} />
            <div className="absolute inset-[-14px] border-[3px] border-dashed border-white/5 rounded-[44px]" />
          </div>
        </div>

        {/* Burger en Movimiento */}
        <div 
          className="absolute top-1/2 z-20 pointer-events-none"
          style={{ 
            left: `${position}%`,
            transform: `translate(-50%, -50%)`,
            transition: isMoving ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <motion.div
            animate={isMoving ? { scaleY: 1, scaleX: 1 } : { 
              scaleY: [1, 0.72, 1.15, 0.9, 1.05, 1], 
              scaleX: [1, 1.22, 0.9, 1.05, 0.97, 1],
              y: [0, 10, -6, 3, 0] 
            }}
            transition={{
              duration: 0.65,
              ease: "easeInOut"
            }}
          >
            <BurgerGraphic />
          </motion.div>

          {/* Animación de destello/chispas al lograr calzar la hamburguesa */}
          {!isMoving && <Sparks />}
        </div>
      </div>

      <button
        onClick={handleStop}
        disabled={!isMoving}
        className={`w-full py-8 rounded-3xl font-black text-4xl uppercase tracking-[0.4em] transition-all duration-150 select-none
          ${!isMoving ? 'opacity-50 scale-95 bg-r9-charcoal' : 'bg-r9-red text-white shadow-[0_12px_0_0_#9B141E] active:translate-y-2 active:shadow-none'}
        `}
      >
        {isMoving ? 'DETENER' : 'CALZADA'}
      </button>
    </div>
  );
}
