import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { sounds } from '../utils/sounds';

// Auxiliar para mezcla de colores en hexadecimal
const interpolateColor = (color1, color2, factor) => {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `rgb(${r}, ${g}, ${b})`;
};

// Generador de colores y brillos según el nivel de cocción
const getPattyColors = (lvl) => {
  let pattyColor = '#D04048';
  let markColor = '#3A1807';
  
  if (lvl <= 30) {
    // Cruda a término medio
    const ratio = lvl / 30;
    pattyColor = interpolateColor('#D04048', '#8E3F24', ratio);
    markColor = '#3A1807';
  } else if (lvl <= 55) {
    // Medio a sellado perfecto
    const ratio = (lvl - 30) / 25;
    pattyColor = interpolateColor('#8E3F24', '#5A290C', ratio);
    markColor = interpolateColor('#3A1807', '#FFA000', ratio);
  } else if (lvl <= 72) {
    // Sellado perfecto (Punto RUTA9)
    const ratio = (lvl - 55) / 17;
    pattyColor = interpolateColor('#5A290C', '#3E1C07', ratio);
    markColor = interpolateColor('#FFA000', '#FF5B00', ratio);
  } else if (lvl <= 90) {
    // Secándose / Pasándose
    const ratio = (lvl - 72) / 18;
    pattyColor = interpolateColor('#3E1C07', '#1E120A', ratio);
    markColor = interpolateColor('#FF5B00', '#1C0D05', ratio);
  } else {
    // Carbonizada con grietas incandescentes
    const ratio = (lvl - 90) / 10;
    pattyColor = interpolateColor('#1E120A', '#111111', ratio);
    markColor = '#FF1A00';
  }

  return { pattyColor, markColor };
};

export default function FireExperience({ onFinish }) {
  const [level, setLevel] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [flareActive, setFlareActive] = useState(false);
  
  const requestRef = useRef();
  const levelRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isPressingRef = useRef(false);
  
  const flareThresholdRef = useRef(48 + Math.random() * 14); // umbral aleatorio entre 48% y 62%
  const flareActiveRef = useRef(false);

  const growFire = (time) => {
    if (!isPressingRef.current) return;

    if (!lastTimeRef.current) lastTimeRef.current = time;
    const delta = (time - lastTimeRef.current) / 16.666;
    lastTimeRef.current = time;

    const currentLevel = levelRef.current;
    
    // Activar Llamarada de Grasa al superar el umbral
    if (currentLevel >= flareThresholdRef.current && !flareActiveRef.current) {
      flareActiveRef.current = true;
      setFlareActive(true);
    }

    if (currentLevel < 100) {
      // Velocidad base 0.55 o desbocada a 1.25 en llamarada
      const speed = flareActiveRef.current ? 1.25 : 0.55;
      levelRef.current += speed * (delta || 1);
      
      if (levelRef.current > 100) levelRef.current = 100;
      setLevel(levelRef.current);
      sounds.updateFireIntensity(levelRef.current, flareActiveRef.current);

      if (levelRef.current < 100) {
        requestRef.current = requestAnimationFrame(growFire);
      } else {
        handleRelease();
      }
    } else {
      handleRelease();
    }
  };

  const handlePress = (e) => {
    if (e) e.preventDefault();
    if (isPressingRef.current) return;

    isPressingRef.current = true;
    setIsPressing(true);
    lastTimeRef.current = 0;
    
    // Resetear parámetros de la partida
    flareThresholdRef.current = 48 + Math.random() * 14;
    flareActiveRef.current = false;
    setFlareActive(false);
    
    sounds.startFireRoar();
    requestRef.current = requestAnimationFrame(growFire);
  };

  const handleRelease = (e) => {
    if (e) e.preventDefault();
    if (!isPressingRef.current) return;

    isPressingRef.current = false;
    setIsPressing(false);
    cancelAnimationFrame(requestRef.current);
    sounds.playImpact();
    sounds.stopFireRoar();
    
    onFinish(levelRef.current);
  };

  // Temblor de pantalla según calor o llamarada activa
  const shakeClass = flareActive 
    ? 'screen-shake-active' 
    : level > 72 
      ? 'screen-shake-light' 
      : '';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative select-none touch-none overflow-hidden">
      {/* Inserción de estilos CSS locales acelerados por hardware */}
      <style>{`
        @keyframes sparkFly {
          0% {
            transform: translate(0, 0) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(var(--dx), var(--dy)) scale(0.1);
            opacity: 0;
          }
        }
        .spark-particle {
          animation: sparkFly 0.9s infinite linear;
        }
        @keyframes shakeMed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          15% { transform: translate(-3px, 3px) rotate(-1deg); }
          30% { transform: translate(3px, -2px) rotate(1deg); }
          45% { transform: translate(-2px, -3px) rotate(-0.5deg); }
          60% { transform: translate(3px, 2px) rotate(0.8deg); }
          75% { transform: translate(-2px, 1px) rotate(-0.4deg); }
          90% { transform: translate(2px, -2px) rotate(0.5deg); }
        }
        @keyframes shakeSlight {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-1px, 1px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, -1px); }
        }
        .screen-shake-active {
          animation: shakeMed 0.15s infinite;
        }
        .screen-shake-light {
          animation: shakeSlight 0.2s infinite;
        }
        @keyframes flamePulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.2; }
          50% { transform: scale(1.15) rotate(2deg); opacity: 0.6; }
        }
        .flame-active-halo {
          animation: flamePulse 0.4s infinite ease-in-out;
        }
      `}</style>

      {/* Humo y Partículas de Fondo */}
      <div className="absolute inset-0 smoke-gradient pointer-events-none" />
      
      {/* Medallón de Hamburguesa Protagonista */}
      <div className={`relative z-10 mb-20 ${shakeClass}`}>
        <motion.div 
          animate={{ 
            scale: 1 + (level / 220),
            filter: flareActive 
              ? `brightness(1.4) saturate(1.4)` 
              : `brightness(${1 + (level / 70)}) saturate(${1 + (level / 120)})`,
          }}
          className="relative transition-all duration-300"
        >
          {/* Círculo base estilo Cinematic Grill */}
          <div className={`w-64 h-64 rounded-full bg-r9-charcoal border-8 border-white/5 flex items-center justify-center relative overflow-hidden ember-glow ${flareActive ? 'border-r9-red/40 shadow-[0_0_50px_rgba(210,31,45,0.7)]' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-r9-red/20 to-transparent" />
              <div className="w-56 h-56 flex items-center justify-center relative z-10">
                  <PattySVG level={level} />
              </div>
          </div>

          {/* Halo de fuego detrás de la carne al activarse la llamarada */}
          <motion.div 
            animate={{ 
                opacity: flareActive ? [0.6, 0.9, 0.6] : level / 100,
                scale: flareActive ? [1.25, 1.4, 1.25] : 1 + (level / 100)
            }}
            className={`absolute inset-0 bg-r9-red/30 blur-[90px] rounded-full -z-10 transition-colors duration-300 ${flareActive ? 'bg-r9-red/50 flame-active-halo' : ''}`}
          />
        </motion.div>

        {/* Emisor de chispas y partículas de grasa hirviendo perimetral */}
        {isPressing && Array.from({ length: 12 }).map((_, idx) => {
          const angle = (idx * (360 / 12)) + Math.random() * 20 - 10;
          const rad = (Math.PI * angle) / 180;
          
          // Movimiento radial exterior con drift ascendente
          const dx = `${Math.round(Math.cos(rad) * (60 + Math.random() * 60))}px`;
          const dy = `${Math.round(Math.sin(rad) * (60 + Math.random() * 60) - 30)}px`;
          
          const delay = `${(Math.random() * 0.8).toFixed(2)}s`;
          const duration = `${(0.5 + Math.random() * 0.5).toFixed(2)}s`;
          
          return (
            <div
              key={idx}
              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full spark-particle pointer-events-none"
              style={{
                '--dx': dx,
                '--dy': dy,
                animationDelay: delay,
                animationDuration: duration,
                backgroundColor: idx % 3 === 0 ? '#FFB800' : idx % 3 === 1 ? '#D21F2D' : '#FF6A00',
                boxShadow: '0 0 6px currentColor',
                marginLeft: '-3px',
                marginTop: '-3px',
                zIndex: 20
              }}
            />
          );
        })}
      </div>

      {/* Instrucciones y Medidor */}
      <div className="relative z-20 w-full max-w-xs space-y-12">
        <div className="text-center">
            <AnimatePresence mode="wait">
                {flareActive ? (
                    <motion.p 
                        key="flare"
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-r9-red uppercase tracking-[0.25em] text-sm font-black animate-pulse"
                        style={{ textShadow: '0 0 10px rgba(210,31,45,0.6)' }}
                    >
                        ¡LLAMARADA DE GRASA! ¡SUELTA YA!
                    </motion.p>
                ) : !isPressing && level === 0 ? (
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

        {/* Medidor Cinematic Grill */}
        <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
                className={`absolute top-0 left-0 h-full transition-colors duration-150
                  ${flareActive 
                    ? 'bg-gradient-to-r from-r9-orange to-r9-red' 
                    : 'bg-gradient-to-r from-r9-red via-r9-orange to-r9-gold'}
                `}
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
            className={`w-full py-10 rounded-[40px] border-2 transition-all duration-500 flex flex-col items-center justify-center gap-2 select-none touch-none
                ${isPressing ? 'bg-white/10 border-white/40 scale-95' : 'bg-r9-dark border-white/5'}
            `}
        >
            <div className={`p-4 rounded-full transition-colors ${isPressing ? 'bg-r9-red text-white' : 'bg-white/5 text-white/20'}`}>
                <Flame size={32} fill={isPressing ? "currentColor" : "none"} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isPressing ? 'text-white' : 'text-white/20'}`}>
                {isPressing ? 'BRASA ARDIENDO...' : 'CALENTAR CARNE'}
            </span>
        </button>
      </div>
    </div>
  );
}

// Sub-componente del Medallón de Hamburguesa en SVG 3D con colores reactivos
function PattySVG({ level }) {
  const { pattyColor, markColor } = getPattyColors(level);
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        {/* Sombreado radial para efecto de relieve esférico */}
        <radialGradient id="patty-shading" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
        </radialGradient>
      </defs>
      
      {/* Sombra proyectada */}
      <circle cx="50" cy="53" r="43" fill="rgba(0,0,0,0.55)" filter="blur(3px)" />
      
      {/* Cuerpo principal rugoso y parrillero del medallón de carne */}
      <path
        d="M 50 6 
           Q 65 7, 78 15 
           Q 91 24, 93 40 
           Q 95 55, 92 68 
           Q 88 82, 75 90 
           Q 60 94, 50 93 
           Q 38 94, 25 90 
           Q 11 82, 7 68 
           Q 5 55, 7 40 
           Q 9 24, 22 15 
           Q 35 7, 50 6 Z"
        fill={pattyColor}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="1"
      />
      
      {/* Textura y grietas perimetrales */}
      <path
        d="M 50 14 Q 68 16, 78 28 Q 86 42, 83 55 Q 80 70, 75 78 Q 65 86, 50 85 Q 32 86, 23 78 Q 14 68, 17 55 Q 19 38, 22 28 Q 32 16, 50 14 Z"
        fill="none"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="1.8"
        strokeDasharray="2 6 8"
      />
      
      {/* Marcas de parrilla caramelizadas y glowing */}
      <g 
        stroke={markColor} 
        strokeWidth="4" 
        strokeLinecap="round" 
        opacity={level > 15 ? 0.9 : 0.15} 
        style={{ 
          filter: (level > 30 && level <= 75) 
            ? 'drop-shadow(0 0 3px #FF8C00) drop-shadow(0 0 6px #FF4500)' 
            : level > 90 
              ? 'drop-shadow(0 0 4px #FF3300)' 
              : 'none' 
        }}
      >
        <line x1="28" y1="32" x2="72" y2="32" />
        <line x1="20" y1="44" x2="80" y2="44" />
        <line x1="18" y1="56" x2="82" y2="56" />
        <line x1="26" y1="68" x2="74" y2="68" />
      </g>
      
      {/* Segunda capa cruzada suave de marcas de parrilla */}
      <g 
        stroke={markColor} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        opacity={level > 40 ? 0.6 : 0.05} 
        style={{ 
          filter: (level > 40 && level <= 75) 
            ? 'drop-shadow(0 0 2px #FF8C00)' 
            : 'none' 
        }}
      >
        <line x1="32" y1="28" x2="32" y2="72" opacity="0.3" />
        <line x1="44" y1="20" x2="44" y2="80" opacity="0.3" />
        <line x1="56" y1="18" x2="56" y2="82" opacity="0.3" />
        <line x1="68" y1="26" x2="68" y2="74" opacity="0.3" />
      </g>

      {/* Sombreado 3D final */}
      <circle cx="50" cy="50" r="43" fill="url(#patty-shading)" />
    </svg>
  );
}
