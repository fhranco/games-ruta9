import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ROULETTE_PRIZES, selectWeightedPrize, calculateRotation } from '../utils/rouletteLogic';
import { ChevronDown } from 'lucide-react';
import { sounds } from '../utils/sounds';

export default function RouletteWheel({ onFinished }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();
  const lastTickAngle = useRef(0);

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    sounds.init();

    const { prize, index } = selectWeightedPrize();
    const targetRotation = calculateRotation(index);
    const segmentAngle = 360 / ROULETTE_PRIZES.length;

    sounds.playSpin(7);

    await controls.start({
      rotate: targetRotation,
      transition: {
        duration: 7,
        ease: [0.15, 0, 0.1, 1],
        onUpdate: (latest) => {
          const currentRotation = latest.rotate;
          if (Math.floor(currentRotation / segmentAngle) > Math.floor(lastTickAngle.current / segmentAngle)) {
              sounds.playTick();
              lastTickAngle.current = currentRotation;
          }
        }
      }
    });

    setTimeout(() => {
      sounds.playWin();
      onFinished(prize);
      setIsSpinning(false);
      lastTickAngle.current = 0;
    }, 500);
  };

  // Generador de segmentos SVG
  const renderSegments = () => {
    const numSegments = ROULETTE_PRIZES.length;
    const angleStep = 360 / numSegments;
    
    return ROULETTE_PRIZES.map((prize, i) => {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;
      
      // Convertir ángulos a radianes para SVG
      const x1 = 200 + 200 * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = 200 + 200 * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = 200 + 200 * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = 200 + 200 * Math.sin((Math.PI * (endAngle - 90)) / 180);
      
      const pathData = `M 200 200 L ${x1} ${y1} A 200 200 0 0 1 ${x2} ${y2} Z`;
      
      return (
        <g key={i}>
          <path d={pathData} fill={prize.color} stroke="#0A0A0A" strokeWidth="2" />
          <g transform={`rotate(${startAngle + angleStep / 2}, 200, 200)`}>
            <text
              x="200"
              y="85"
              fill="white"
              stroke="#0A0A0A"
              strokeWidth="0.5"
              fontSize="14"
              fontWeight="900"
              textAnchor="middle"
              transform="rotate(-90, 200, 85)"
              style={{ 
                textTransform: 'uppercase', 
                letterSpacing: '-0.02em',
                paintOrder: 'stroke fill'
              }}
            >
              {prize.label}
            </text>
          </g>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-16 py-8">
      <div className="relative">
        {/* Marcador Superior */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 text-r9-red drop-shadow-[0_0_15px_rgba(210,31,45,0.8)]">
          <ChevronDown size={80} strokeWidth={5} />
        </div>

        {/* Rueda SVG - Máxima Escala */}
        <motion.div
          animate={controls}
          className="w-[92vw] h-[92vw] max-w-[480px] max-h-[480px] drop-shadow-[0_0_60px_rgba(255,184,0,0.25)]"
        >
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
            <defs>
              {/* Brillo Metálico para el Borde */}
              <linearGradient id="metal-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2A2A2A" />
                <stop offset="50%" stopColor="#4A4A4A" />
                <stop offset="100%" stopColor="#1A1A1A" />
              </linearGradient>
              
              {/* Sombra Interna Segmentos */}
              <radialGradient id="inner-shade" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
              </radialGradient>
            </defs>

            {/* Borde Metálico Exterior */}
            <circle cx="200" cy="200" r="198" fill="url(#metal-ring)" stroke="#FFB800" strokeWidth="2" />
            
            {/* Capa de Sombras Radiales (Fondo para segmentos) */}
            <circle cx="200" cy="200" r="198" fill="url(#inner-shade)" pointerEvents="none" />

            {/* Brillo de Cristal Superior (Debajo del texto) */}
            <path 
              d="M 40 120 A 180 180 0 0 1 360 120" 
              fill="none" 
              stroke="white" 
              strokeWidth="40" 
              strokeOpacity="0.03" 
              strokeLinecap="round" 
              pointerEvents="none"
            />

            {/* SEGMENTOS Y TEXTOS (AHORA ARRIBA) */}
            <g>
              {renderSegments()}
            </g>

            {/* Centro Estilo Motorizado */}
            <circle cx="200" cy="200" r="35" fill="#0A0A0A" stroke="#444" strokeWidth="2" />
            <circle cx="200" cy="200" r="30" fill="#1A1A1A" stroke="#FFB800" strokeWidth="3" />
            <circle cx="200" cy="200" r="8" fill="#D21F2D" className="animate-pulse" />
          </svg>
        </motion.div>
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className={`px-16 py-8 rounded-3xl font-black text-3xl uppercase tracking-[0.3em] transition-all 
          ${isSpinning ? 'opacity-50 scale-95 bg-r9-charcoal text-white/20' : 'bg-r9-red text-white shadow-[0_12px_0_0_#9B141E] hover:bg-[#F52538] active:translate-y-2 active:shadow-none'}
        `}
      >
        {isSpinning ? 'GIRANDO...' : '¡GIRAR!'}
      </button>
    </div>
  );
}
