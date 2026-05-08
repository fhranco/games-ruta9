import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable fullscreen: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="fixed top-4 right-4 z-[100] p-3 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
      title="Modo Tótem"
    >
      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
    </button>
  );
}
