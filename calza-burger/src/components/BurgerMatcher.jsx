import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../utils/sounds';

const BurgerGraphic = ({ isShadow = false }) => (
  <div className={`relative flex flex-col items-center justify-center w-48 h-40 ${isShadow ? 'opacity-20 grayscale' : 'drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]'}`}>
    {/* Pan Superior */}
    <div className={`w-40 h-16 rounded-t-[100px] border-b-4 border-black/10 ${isShadow ? 'bg-white' : 'bg-[#D68D3E]'}`} />
    
    {/* Queso */}
    <div className={`w-44 h-2 -mt-2 rounded-full skew-x-12 ${isShadow ? 'bg-white' : 'bg-[#FFB800]'}`} />
    
    {/* Carne */}
    <div className={`w-42 h-10 -mt-1 rounded-2xl ${isShadow ? 'bg-white' : 'bg-[#3D1C02]'}`} />
    
    {/* Pan Inferior */}
    <div className={`w-40 h-8 rounded-b-2xl border-t-4 border-black/10 ${isShadow ? 'bg-white' : 'bg-[#D68D3E]'}`} />
    
    {!isShadow && (
      <div className="absolute top-4 w-32 h-8 flex justify-around opacity-20">
        {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-2 bg-white rounded-full rotate-45" />)}
      </div>
    )}
  </div>
);

export default function BurgerMatcher({ onStop }) {
  const [position, setPosition] = useState(0);
  const [isMoving, setIsMoving] = useState(true);
  const requestRef = useRef();
  const directionRef = useRef(1);
  const speed = 1.4;

  const currentSpeedRef = useRef(1.8);

  const animate = () => {
    setPosition((prev) => {
      let next = prev + directionRef.current * currentSpeedRef.current;
      
      if (next >= 100) {
        directionRef.current = -1;
        currentSpeedRef.current = Math.random() * 2 + 1.2;
        sounds.playTap(); // Sonido de rebote
        return 100;
      }
      if (next <= 0) {
        directionRef.current = 1;
        currentSpeedRef.current = Math.random() * 2 + 1.2;
        sounds.playTap(); // Sonido de rebote
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
    <div className="flex flex-col items-center justify-between h-[60vh] py-12 px-4 relative">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Detén la Burger</h2>
        <p className="text-white/40 text-xs uppercase tracking-[0.2em]">Cálzala justo en el centro</p>
      </div>

      <div 
        onClick={handleStop}
        className={`relative w-full h-80 flex items-center justify-center cursor-none ${isMoving ? 'active:scale-95' : ''} transition-transform`}
      >
        {/* Sombra Fija al Centro Exacto */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="relative">
            <BurgerGraphic isShadow={true} />
            <div className="absolute inset-[-10px] border-2 border-dashed border-white/5 rounded-[40px]" />
          </div>
        </div>

        {/* Burger en Movimiento (Misma base Y que la sombra) */}
        <div 
          className="absolute top-1/2 z-20 pointer-events-none"
          style={{ 
            left: `${position}%`,
            transform: `translate(-50%, -50%)`,
            transition: isMoving ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <BurgerGraphic />
        </div>
      </div>

      <button
        onClick={handleStop}
        disabled={!isMoving}
        className={`w-full py-8 rounded-3xl font-black text-4xl uppercase tracking-[0.4em] transition-all
          ${!isMoving ? 'opacity-50 scale-95 bg-r9-charcoal' : 'bg-r9-red text-white shadow-[0_12px_0_0_#9B141E] active:translate-y-2 active:shadow-none'}
        `}
      >
        {isMoving ? 'DETENER' : 'CALZADA'}
      </button>
    </div>
  );
}
