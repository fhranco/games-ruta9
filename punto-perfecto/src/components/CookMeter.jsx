import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, ChevronUp } from 'lucide-react';

export default function CookMeter({ onStop }) {
  const [position, setPosition] = useState(0);
  const [isMoving, setIsMoving] = useState(true);
  const requestRef = useRef();
  const directionRef = useRef(1); // 1 = right, -1 = left
  const speed = 2.8;

  const animate = (time) => {
    setPosition((prev) => {
      let next = prev + directionRef.current * speed;
      
      if (next >= 100) {
        directionRef.current = -1;
        return 100;
      }
      if (next <= 0) {
        directionRef.current = 1;
        return 0;
      }
      return next;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleStop = () => {
    if (!isMoving) return;
    setIsMoving(false);
    cancelAnimationFrame(requestRef.current);
    onStop(position);
  };

  return (
    <div className="flex flex-col items-center gap-16 w-full max-w-md mx-auto p-4">
      <div className="relative w-full">
        {/* Etiquetas de cocción */}
        <div className="flex justify-between w-full mb-4 px-2">
          <span className="text-[10px] font-black opacity-40">CRUDA</span>
          <span className="text-[10px] font-black opacity-40">CASI</span>
          <span className="text-[10px] font-black text-r9-gold">PERFECTA</span>
          <span className="text-[10px] font-black opacity-40">PASADA</span>
          <span className="text-[10px] font-black opacity-40">QUEMADA</span>
        </div>

        {/* La Barra de Cocción */}
        <div className="h-24 w-full rounded-2xl fire-gradient relative shadow-[0_0_40px_rgba(210,31,45,0.2)] overflow-hidden">
            {/* Efecto de calor interno */}
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Marcador Central (Punto Perfecto) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-20 bg-white/10 border-x-2 border-white/20 backdrop-blur-sm flex items-center justify-center">
                <Flame className="text-r9-gold animate-pulse" size={40} />
            </div>

            {/* El Marcador Móvil */}
            <div 
                className="absolute top-0 h-full w-1 bg-white shadow-[0_0_20px_white] z-10 transition-transform duration-75"
                style={{ left: `${position}%` }}
            >
                <div className="absolute -top-2 -left-3 text-white">
                    <ChevronUp className="rotate-180" size={28} strokeWidth={4} />
                </div>
                <div className="absolute -bottom-2 -left-3 text-white">
                    <ChevronUp size={28} strokeWidth={4} />
                </div>
            </div>
        </div>

        {/* Guía de Punto Perfecto */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
            <span className="text-8xl font-black text-white whitespace-nowrap tracking-tighter">PUNTO R9</span>
        </div>
      </div>

      <button
        onClick={handleStop}
        disabled={!isMoving}
        className={`w-full py-8 rounded-3xl font-black text-4xl uppercase tracking-[0.4em] transition-all
          ${!isMoving ? 'opacity-50 scale-95 bg-r9-charcoal' : 'bg-r9-red text-white shadow-[0_12px_0_0_#9B141E] active:translate-y-2 active:shadow-none'}
        `}
      >
        {isMoving ? 'DETENER' : 'LOGRADO'}
      </button>
    </div>
  );
}
