import React from 'react';
import PrimaryButton from './PrimaryButton';
import { motion } from 'framer-motion';

export default function WelcomeScreen({ onPlay, onRules }) {
  const handleFullscreen = () => {
    const elem = document.documentElement;
    const requestMethod = elem.requestFullscreen || 
                          elem.webkitRequestFullscreen || 
                          elem.mozRequestFullScreen || 
                          elem.msRequestFullscreen;

    if (requestMethod) {
      requestMethod.call(elem).catch(err => {
        console.warn("Pantalla completa no disponible o bloqueada:", err);
      });
    }
  };

  const handlePlay = () => {
    handleFullscreen();
    onPlay();
  };
  return (
    <div className="h-full flex flex-col items-center justify-between py-12 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center"
      >
        <div className="mb-12 relative">
          <div className="absolute -inset-8 bg-r9-red/20 blur-3xl rounded-full"></div>
          <h2 className="text-8xl font-black text-white leading-none relative">
            DETÉN <br/> 
            <span className="text-r9-red text-glow-red italic">EL 9</span>
          </h2>
        </div>
        
        <p className="text-xl text-white/60 max-w-xs leading-relaxed mb-8">
          ¿Tienes precisión Ruta9? Detén el cronómetro en <span className="text-white font-bold">9.000 segundos</span> y desbloquea beneficios exclusivos.
        </p>
      </motion.div>

      <div className="w-full space-y-4">
        <PrimaryButton variant="red" onClick={handlePlay}>
          EMPEZAR A JUGAR
        </PrimaryButton>
        <PrimaryButton variant="outline" onClick={onRules}>
          REGLAS DEL JUEGO
        </PrimaryButton>
        <button 
          onClick={handleFullscreen}
          className="text-[10px] text-white/20 uppercase tracking-[0.2em] pt-4 hover:text-r9-gold transition-colors"
        >
          Activar Modo Tótem (Pantalla Completa)
        </button>
      </div>
    </div>
  );
}
