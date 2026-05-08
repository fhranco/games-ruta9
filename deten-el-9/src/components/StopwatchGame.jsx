import React, { useState, useEffect, useRef } from 'react';
import PrimaryButton from './PrimaryButton';
import { motion } from 'framer-motion';
import { sounds } from '../utils/sounds';

export default function StopwatchGame({ onFinished }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const startTimeRef = useRef(performance.now());
  const requestRef = useRef();

  const animate = (now) => {
    if (isRunning) {
      const elapsed = (now - startTimeRef.current) / 1000;
      setTime(elapsed);
      sounds.updateMotorPitch(elapsed);
      
      // Auto-stop at 12s
      if (elapsed >= 12.00) {
        handleStop(12.00);
        return;
      }
      
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    startTimeRef.current = performance.now();
    sounds.startMotor();
    requestRef.current = requestAnimationFrame(animate);
    return () => {
        cancelAnimationFrame(requestRef.current);
        sounds.stopMotor();
    };
  }, []);

  const handleStop = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isRunning) return;
    
    sounds.stopMotor();
    sounds.playStop();
    setIsRunning(false);
    cancelAnimationFrame(requestRef.current);
    const stoppedAt = time;
    
    setTimeout(() => {
      onFinished(stoppedAt);
    }, 1200);
  };

  const getTimeColor = () => {
    if (time >= 8.9 && time <= 9.1) return 'text-r9-red text-glow-red animate-pulse';
    if (time >= 8.0) return 'text-r9-gold text-glow-gold';
    return 'text-white/80';
  };

  return (
    <div className="h-full flex flex-col items-center justify-between py-12 relative z-50">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white/40">Detén el tiempo en</h2>
        <h3 className="text-6xl font-black text-r9-gold text-glow-gold">9.000s</h3>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <motion.div 
          className={`text-9xl font-black tabular-nums tracking-tighter transition-colors duration-100 ${getTimeColor()}`}
        >
          {time.toFixed(3)}
        </motion.div>
      </div>

      <div className="w-full">
        {isRunning ? (
          <button 
            onMouseDown={handleStop}
            onTouchStart={handleStop}
            className="w-full h-40 bg-r9-red text-white text-4xl font-black rounded-3xl shadow-[0_12px_0_0_#9B141E] active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest"
          >
            ¡DETENER!
          </button>
        ) : (
          <div className="h-40 flex items-center justify-center">
             <span className="text-2xl font-black text-r9-gold animate-pulse italic uppercase">Calculando Precisión...</span>
          </div>
        )}
      </div>
    </div>
  );
}
