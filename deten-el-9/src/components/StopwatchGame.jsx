import React, { useState, useEffect, useRef } from 'react';
import PrimaryButton from './PrimaryButton';
import { motion } from 'framer-motion';
import { sounds } from '../utils/sounds';

export default function StopwatchGame({ onFinished }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const isRunningRef = useRef(true);
  const startTimeRef = useRef(performance.now());
  const requestRef = useRef();
  const [canWin, setCanWin] = useState(false);

  useEffect(() => {
    const checkStock = async () => {
      try {
        const apiHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : '';
        const response = await fetch(`${apiHost}/api/can-win?gameId=deten-el-9`);
        if (response.ok) {
          const data = await response.json();
          setCanWin(data.canWin);
        } else {
          setCanWin(false);
        }
      } catch (err) {
        console.warn('⚠️ Offline o error de conexión al servidor de stock. Usando contingencia offline activa (canWin = true).', err.message);
        setCanWin(true);
      }
    };
    checkStock();
  }, []);

  const animate = (now) => {
    if (isRunningRef.current) {
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
    isRunningRef.current = true;
    setIsRunning(true);
    sounds.startMotor();
    requestRef.current = requestAnimationFrame(animate);
    return () => {
        cancelAnimationFrame(requestRef.current);
        sounds.stopMotor();
    };
  }, []);

  const handleStop = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (!isRunningRef.current) return;
    
    isRunningRef.current = false;
    setIsRunning(false);
    sounds.stopMotor();
    sounds.playStop();
    cancelAnimationFrame(requestRef.current);
    
    let stoppedAt = time;
    if (!canWin) {
      const diff = Math.abs(stoppedAt - 9.00);
      if (diff <= 0.05) {
        // Inyectar error matemático sutil para forzar pérdida (> 0.05s de diferencia)
        const sign = stoppedAt >= 9.00 ? 1 : -1;
        stoppedAt = 9.00 + sign * (0.052 + Math.random() * 0.01);
        setTime(stoppedAt);
      }
    }
    
    setTimeout(() => {
      onFinished(stoppedAt);
    }, 1200);
  };

  const getTimeColor = () => {
    if (time >= 8.9 && time <= 9.1) return 'text-r9-red text-glow-red';
    if (time >= 8.0) return 'text-r9-gold text-glow-gold';
    return 'text-white/80';
  };

  // Función matemática de distorsión extrema e interactiva para añadir dificultad progresiva
  const getDistortionStyle = () => {
    if (!isRunning) return {};

    // La distorsión comienza gradualmente a los 4 segundos y llega a su máxima intensidad a los 8 segundos
    if (time < 4.0) return {};

    const intensity = Math.min((time - 4.0) / 4.0, 1.0); // De 0.0 a 1.0 en el rango de [4s, 8s]

    // 1. Oscilación de desenfoque de alta frecuencia (entre 0px y 7.5px de blur)
    const blurFreq = time * 18;
    const blur = Math.abs(Math.sin(blurFreq)) * 7.5 * intensity;

    // 2. Deformación angular (skew) aleatoria
    const skewX = Math.sin(time * 16) * 12 * intensity; // Inclinación en X (hasta +/- 12 grados)
    const skewY = Math.cos(time * 24) * 6 * intensity;  // Inclinación en Y (hasta +/- 6 grados)

    // 3. Vibración / Temblor (glitch translation displacement)
    const translateX = Math.sin(time * 48) * 4 * intensity;
    const translateY = Math.cos(time * 42) * 4 * intensity;

    return {
      filter: `blur(${blur.toFixed(2)}px)`,
      transform: `skew(${skewX.toFixed(1)}deg, ${skewY.toFixed(1)}deg) translate(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px)`,
      transition: 'filter 0.03s linear, transform 0.03s linear'
    };
  };

  return (
    <div className="h-full flex flex-col items-center justify-between py-12 relative z-50">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white/40">Detén el tiempo en</h2>
        <h3 className="text-6xl font-black text-r9-gold text-glow-gold">9.000s</h3>
        
        {isRunning && time >= 4.0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-black text-r9-red drop-shadow-[0_0_8px_rgba(197,32,38,0.6)] tracking-[0.25em] uppercase"
            style={{ animation: 'pulse 1.2s infinite ease-in-out' }}
          >
            ⚠️ ¡DISTORSIÓN DE TIEMPO ACTIVA! ⚠️
          </motion.div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center overflow-visible">
        <motion.div 
          className={`text-9xl font-black tabular-nums tracking-tighter transition-colors duration-100 ${getTimeColor()}`}
          style={getDistortionStyle()}
        >
          {time.toFixed(3)}
        </motion.div>
      </div>

      <div className="w-full">
        {isRunning ? (
          <button 
            onPointerDown={handleStop}
            className="w-full h-40 bg-r9-red text-white text-4xl font-black rounded-3xl shadow-[0_12px_0_0_#9B141E] active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest cursor-pointer select-none touch-none"
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
