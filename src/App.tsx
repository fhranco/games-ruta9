"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Trophy, Star, Zap, Flame, Ghost, Gamepad2, ChevronRight, Wifi } from "lucide-react";

const GAMES = [
  {
    id: "ruta-millonaria",
    name: "Ruta Millonaria",
    description: "Trivia extrema sobre nuestra carta. ¡Gana cupones!",
    icon: <Trophy className="w-8 h-8 text-yellow-500" />,
    color: "#D1232B"
  },
  {
    id: "calza-burger",
    name: "Calza Burger",
    description: "Arma la burger perfecta en el menor tiempo posible.",
    icon: <Star className="w-8 h-8 text-orange-500" />,
    color: "#5D3A2C"
  },
  {
    id: "deten-el-9",
    name: "Detén el 9",
    description: "Reflejos puros. Detén el cronómetro justo en el 9.00.",
    icon: <Zap className="w-8 h-8 text-blue-500" />,
    color: "#0D0D12"
  },
  {
    id: "ruleta",
    name: "Ruleta Ruta 9",
    description: "Gira la rueda y descubre qué burger comerás hoy.",
    icon: <Ghost className="w-8 h-8 text-purple-500" />,
    color: "#D1232B"
  },
  {
    id: "ruta-del-fuego",
    name: "Ruta del Fuego",
    description: "Esquiva los obstáculos y llega a la meta.",
    icon: <Flame className="w-8 h-8 text-red-500" />,
    color: "#ff5500"
  },
  {
    id: "punto-perfecto",
    name: "Punto Perfecto",
    description: "Cocina la carne al punto exacto.",
    icon: <Gamepad2 className="w-8 h-8 text-green-500" />,
    color: "#22c55e"
  }
];

const SURVEY_QUESTIONS = [
  {
    question: "¿Qué te parece el diseño visual y la estética de esta pantalla?",
    options: [
      { key: "A", text: "¡Increíble / Premium! (10/10)" },
      { key: "B", text: "Muy atractivo" },
      { key: "C", text: "Normal / Aceptable" },
      { key: "D", text: "Se puede mejorar" }
    ]
  },
  {
    question: "¿Qué tan fácil y rápido te resultó interactuar con los menús y juegos?",
    options: [
      { key: "A", text: "Súper fluida e instantánea" },
      { key: "B", text: "Rápida y cómoda" },
      { key: "C", text: "Normal / Estándar" },
      { key: "D", text: "Un poco lenta" }
    ]
  },
  {
    question: "¿Te gustaría encontrar más dinámicas de juego con premios en tu próxima visita?",
    options: [
      { key: "A", text: "¡Sí, definitivamente!" },
      { key: "B", text: "Tal vez, si hay buenos premios" },
      { key: "C", text: "Prefiero solo ver la carta tradicional" }
    ]
  },
  {
    question: "¿Recomendarías esta experiencia de juego interactiva en Ruta 9?",
    options: [
      { key: "A", text: "100% Recomendado" },
      { key: "B", text: "Sí, es divertida e innovadora" },
      { key: "C", text: "No, prefiero lo tradicional" }
    ]
  }
];


export default function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isKioskStarted, setIsKioskStarted] = useState(false);
  
  // Estados para la encuesta de validación
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<string[]>([]);
  const [surveyCoupon, setSurveyCoupon] = useState("");
  
  // Estados para el desbloqueo secreto del juego (5 toques en esquina superior derecha)
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showTapFlash, setShowTapFlash] = useState(false);

  // Auto-resetear el contador de toques si el usuario deja de tocar por más de 1.5 segundos
  useEffect(() => {
    if (secretTapCount > 0) {
      const timer = setTimeout(() => {
        setSecretTapCount(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [secretTapCount]);

  // Escuchar mensajes de los sub-juegos para salir de forma segura
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "EXIT_GAME") {
        setActiveGame(null);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSecretExitTap = () => {
    const now = Date.now();
    
    // Feedback visual sutil
    setShowTapFlash(true);
    setTimeout(() => setShowTapFlash(false), 200);

    const newCount = secretTapCount + 1;
    if (newCount >= 5) {
      setActiveGame(null);
      setSecretTapCount(0);
    } else {
      setSecretTapCount(newCount);
    }
    setLastTapTime(now);
  };

  // Escuchar si se sale de pantalla completa para volver a bloquear el totem
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      if (!isCurrentlyFullscreen) {
        setIsKioskStarted(false);
      } else {
        setIsKioskStarted(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const startKioskMode = () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen().catch(() => {});
    } else if ((docElm as any).mozRequestFullScreen) {
      (docElm as any).mozRequestFullScreen().catch(() => {});
    } else if ((docElm as any).webkitRequestFullscreen) {
      (docElm as any).webkitRequestFullscreen().catch(() => {});
    } else if ((docElm as any).msRequestFullscreen) {
      (docElm as any).msRequestFullscreen().catch(() => {});
    }
    setIsKioskStarted(true);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-r9-dark font-inter gradient-mesh">
      <div className="noise-overlay" />

      {/* Header Bar */}
      <header className="fixed top-0 left-0 w-full z-[100] py-4 px-8 flex justify-between items-center bg-gradient-to-b from-r9-dark via-r9-dark/95 to-transparent border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/10 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden p-2 transition-transform duration-500 group-hover:scale-105">
              <img src="/logo.png" alt="Ruta 9 Logo" className="w-full h-full object-contain scale-110" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white flex items-baseline gap-2">
              <span className="text-r9-red drop-shadow-[0_0_10px_rgba(197,32,38,0.4)]">ARCADE</span>
              <span className="text-sm font-bold text-white/70 tracking-widest uppercase">EXPERIENCE</span>
            </h1>
            <div className="flex items-center gap-3 mt-1.5 ml-0.5">
              <p className="text-[9px] font-black text-r9-gold uppercase tracking-[0.4em]">
                SÁNDWICH • BAR • COCINA
              </p>
              <span className="text-white/20 text-[9px]">•</span>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
                Punta Arenas • Chile
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Survey Validation Card */}
          <button 
            onClick={() => {
              setSurveyIndex(0);
              setSurveyAnswers([]);
              setSurveyCoupon("");
              setIsSurveyOpen(true);
            }}
            className="group bg-r9-red/10 hover:bg-r9-red/20 hover:border-r9-gold/30 border border-r9-red/30 px-4 py-2 rounded-xl backdrop-blur-3xl shadow-xl flex items-center gap-3 transition-all duration-300 cursor-pointer"
          >
            <div className="relative">
              <Star className="w-4 h-4 text-r9-gold group-hover:scale-110 transition-transform duration-300 fill-r9-gold" />
              <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-r9-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-r9-gold"></span>
              </span>
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40">PROYECTO TÓTEM</span>
              <span className="text-[10px] font-black uppercase text-white/90 group-hover:text-r9-gold transition-colors">⭐ VALIDAR TÓTEM</span>
            </div>
          </button>

          {/* WiFi Connection Card */}
          <button 
            onClick={() => setIsWifiOpen(true)}
            className="group bg-r9-charcoal/90 hover:bg-r9-charcoal hover:border-r9-gold/30 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-3xl shadow-xl flex items-center gap-3 transition-all duration-300 cursor-pointer"
          >
            <div className="relative">
              <Wifi className="w-4 h-4 text-r9-gold group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-r9-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-r9-gold"></span>
              </span>
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">WIFI CLIENTES</span>
              <span className="text-[10px] font-black uppercase text-white/90 group-hover:text-r9-gold transition-colors">CONECTAR</span>
            </div>
          </button>

          {/* Totem Status Card */}
          <div className="bg-r9-charcoal/90 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-3xl shadow-xl flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">ESTADO DEL TÓTEM</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-white/90">SISTEMA ONLINE</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" />
              </div>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/5 mx-1" />

          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
            V2.4.0 • Totem Digital
          </p>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 w-full h-full pt-32 px-16 pb-24 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {GAMES.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={() => setActiveGame(game.id)}
                className="group relative w-full aspect-[4/5.5] bg-r9-charcoal/40 backdrop-blur-xl border border-white/5 rounded-[3.5rem] overflow-hidden flex flex-col items-center justify-center p-12 transition-all duration-500 hover:scale-[1.03] hover:border-r9-red/30 active:scale-[0.98] shadow-2xl"
              >
                {/* Game Icon Container */}
                <div className="relative z-20 w-40 h-40 rounded-[3rem] bg-r9-dark flex items-center justify-center border border-white/5 group-hover:border-r9-red transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-r9-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="group-hover:scale-110 transition-transform duration-700 ease-out transform-gpu">
                    {React.cloneElement(game.icon as React.ReactElement, { 
                      className: `w-20 h-20 ${game.id === 'ruta-millonaria' ? 'text-r9-gold' : 'text-r9-red'}`,
                      style: { filter: 'drop-shadow(0 0 20px currentColor)' }
                    })}
                  </div>
                </div>

                {/* Info */}
                <div className="relative z-20 text-center mt-12">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4 group-hover:text-r9-gold transition-colors duration-500">
                    {game.name}
                  </h3>
                  <div className="w-16 h-1 bg-r9-red/20 mx-auto mb-6 group-hover:w-32 group-hover:bg-r9-red transition-all duration-500" />
                  <p className="text-base font-medium text-white/40 max-w-[280px] leading-relaxed group-hover:text-white/60 transition-colors duration-500">
                    {game.description}
                  </p>
                </div>

                {/* Launch Button */}
                <div className="absolute bottom-12 z-20 flex flex-col items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-6 group-hover:translate-y-0">
                   <div className="px-10 py-3 bg-r9-red text-white text-xs font-black uppercase tracking-[0.3em] rounded-full shadow-[0_10px_40px_rgba(210,31,45,0.4)] hover:bg-r9-red/90 transition-colors">
                     INICIAR JUEGO
                   </div>
                </div>

                {/* Background Interactive Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-1000 blur-[100px]"
                  style={{ background: `radial-gradient(circle at center, ${game.color}, transparent 80%)` }}
                />
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Game Iframe Overlay */}
      <AnimatePresence>
        {activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-r9-dark"
          >
            {/* Botón Seguro de Volver al Menú / Lista de Juegos (Requiere 5 toques seguidos) */}
            <div className="absolute top-6 right-6 z-[1010] flex items-center gap-4">
              <button
                onClick={handleSecretExitTap}
                className="group relative flex items-center gap-3.5 bg-r9-charcoal/90 hover:bg-r9-charcoal border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-300 active:scale-95 select-none"
              >
                {/* Indicador de toques restantes */}
                <div className="relative w-8 h-8 rounded-full bg-r9-dark border border-white/10 flex items-center justify-center font-bold text-xs text-glow-gold">
                  {secretTapCount === 0 ? (
                    <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white/90 rotate-180 transition-colors" />
                  ) : (
                    <span className="text-r9-gold animate-bounce">{5 - secretTapCount}</span>
                  )}
                </div>
                
                <div className="flex flex-col items-start text-left pr-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                    {secretTapCount === 0 ? "INTERRUPCIÓN SEGURA" : "CONFIRMACIÓN"}
                  </span>
                  <span className="text-[11px] font-black uppercase text-white/95 tracking-wide">
                    {secretTapCount === 0 ? "VOLVER A JUEGOS" : "TOCA PARA VOLVER"}
                  </span>
                </div>

                {/* Sutil destello dorado en la esquina del botón */}
                <AnimatePresence>
                  {showTapFlash && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 0.15, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-r9-gold blur-[1px]"
                    />
                  )}
                </AnimatePresence>

                {/* Barra de progreso de toques acumulados en la parte inferior */}
                {secretTapCount > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-r9-red/10 rounded-b-2xl overflow-hidden">
                    <div 
                      className="h-full bg-r9-red transition-all duration-300"
                      style={{ width: `${(secretTapCount / 5) * 100}%` }}
                    />
                  </div>
                )}
              </button>
            </div>

            <iframe
              src={`games/${activeGame}/index.html`}
              className="w-full h-full border-none shadow-2xl bg-r9-dark"
              title="Game Content"
              allow="autoplay; speech-synthesis; fullscreen"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* WiFi Connection Modal */}
      <AnimatePresence>
        {isWifiOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-r9-dark/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.15 }}
              className="relative w-full max-w-xl bg-r9-charcoal/90 border border-white/10 rounded-[3rem] p-12 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Decorative Mesh Background */}
              <div className="absolute inset-0 pointer-events-none opacity-20 blur-[80px]"
                style={{ background: 'radial-gradient(circle at center, var(--color-r9-red), transparent 70%)' }}
              />

              {/* Close Button */}
              <button
                onClick={() => setIsWifiOpen(false)}
                className="absolute top-8 right-8 w-14 h-14 bg-white/5 hover:bg-r9-red hover:text-white border border-white/5 text-white/60 rounded-2xl flex items-center justify-center active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Modal Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-r9-gold/10 border border-r9-gold/30 flex items-center justify-center mb-8">
                  <Wifi className="w-10 h-10 text-r9-gold animate-pulse" />
                </div>

                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                  CONEXIÓN WIFI RUTA 9
                </h3>
                <p className="text-xs font-black text-r9-gold uppercase tracking-[0.4em] mb-10">
                  ACCESO GRATUITO AL INSTANTE
                </p>

                {/* QR Code Frame */}
                <div className="relative group p-6 bg-white rounded-[2.5rem] shadow-2xl mb-10 transition-transform duration-500 hover:scale-105">
                  {/* Subtle pulsing background glow behind QR */}
                  <div className="absolute inset-0 bg-r9-gold/10 blur-xl rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative w-56 h-56 flex items-center justify-center bg-white p-2 rounded-2xl">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                      {/* Quiet luxury styled vector QR simulation */}
                      <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                      <rect x="3" y="3" width="19" height="19" fill="white" />
                      <rect x="7" y="7" width="11" height="11" fill="currentColor" />
                      
                      <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                      <rect x="78" y="3" width="19" height="19" fill="white" />
                      <rect x="82" y="7" width="11" height="11" fill="currentColor" />
                      
                      <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                      <rect x="3" y="78" width="19" height="19" fill="white" />
                      <rect x="7" y="82" width="11" height="11" fill="currentColor" />
                      
                      {/* Matrix dots */}
                      <rect x="30" y="5" width="5" height="10" fill="currentColor" />
                      <rect x="40" y="0" width="10" height="5" fill="currentColor" />
                      <rect x="55" y="5" width="5" height="15" fill="currentColor" />
                      <rect x="65" y="0" width="5" height="5" fill="currentColor" />
                      
                      <rect x="30" y="20" width="15" height="5" fill="currentColor" />
                      <rect x="50" y="25" width="5" height="10" fill="currentColor" />
                      <rect x="60" y="20" width="10" height="5" fill="currentColor" />
                      
                      <rect x="5" y="30" width="10" height="5" fill="currentColor" />
                      <rect x="20" y="30" width="5" height="15" fill="currentColor" />
                      <rect x="0" y="40" width="15" height="5" fill="currentColor" />
                      
                      <rect x="30" y="40" width="5" height="5" fill="currentColor" />
                      <rect x="40" y="45" width="15" height="5" fill="currentColor" />
                      <rect x="60" y="40" width="5" height="20" fill="currentColor" />
                      <rect x="70" y="30" width="10" height="5" fill="currentColor" />
                      <rect x="85" y="35" width="15" height="5" fill="currentColor" />
                      
                      <rect x="30" y="55" width="20" height="5" fill="currentColor" />
                      <rect x="55" y="60" width="5" height="15" fill="currentColor" />
                      <rect x="45" y="70" width="5" height="5" fill="currentColor" />
                      
                      <rect x="75" y="50" width="5" height="15" fill="currentColor" />
                      <rect x="85" y="55" width="10" height="5" fill="currentColor" />
                      <rect x="70" y="70" width="5" height="10" fill="currentColor" />
                      
                      <rect x="30" y="80" width="10" height="5" fill="currentColor" />
                      <rect x="45" y="85" width="5" height="10" fill="currentColor" />
                      <rect x="55" y="80" width="15" height="5" fill="currentColor" />
                      <rect x="80" y="80" width="15" height="5" fill="currentColor" />
                      <rect x="75" y="90" width="5" height="10" fill="currentColor" />
                      <rect x="85" y="90" width="10" height="5" fill="currentColor" />

                      {/* Stylized Badge */}
                      <rect x="38" y="38" width="24" height="24" rx="4" fill="white" />
                      <rect x="40" y="40" width="20" height="20" rx="3" fill="var(--color-r9-red)" />
                      <text x="50" y="54" fontSize="13" fontWeight="900" fontStyle="italic" fill="white" textAnchor="middle">R9</text>
                    </svg>
                  </div>
                </div>

                <p className="text-sm font-semibold text-white/50 mb-8 max-w-sm">
                  Escanea el código QR con la cámara de tu teléfono para conectarte automáticamente sin ingresar claves.
                </p>

                {/* Manual Connection Info */}
                <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 text-left">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/30">Nombre de Red (SSID)</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Ruta9_Cliente_Premium</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/30">Contraseña (WPA2)</span>
                    <span className="text-sm font-bold text-r9-gold uppercase tracking-widest font-outfit">ruta9patagonia</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Validation Survey Modal */}
      <AnimatePresence>
        {isSurveyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-r9-dark/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.15 }}
              className="relative w-full max-w-xl bg-r9-charcoal/90 border border-white/10 rounded-[3rem] p-12 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Decorative Mesh Background */}
              <div className="absolute inset-0 pointer-events-none opacity-20 blur-[80px]"
                style={{ background: 'radial-gradient(circle at center, var(--color-r9-red), transparent 70%)' }}
              />

              {/* Close Button */}
              <button
                onClick={() => setIsSurveyOpen(false)}
                className="absolute top-8 right-8 w-14 h-14 bg-white/5 hover:bg-r9-red hover:text-white border border-white/5 text-white/60 rounded-2xl flex items-center justify-center active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {surveyCoupon === "" ? (
                /* Encuesta Activa */
                <div className="relative z-10 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-r9-gold">VALIDACIÓN DE PROYECTO</span>
                    <span className="text-xs font-bold text-white/40">Pregunta {surveyIndex + 1} de {SURVEY_QUESTIONS.length}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
                    <div 
                      className="h-full bg-gradient-to-r from-r9-red to-r9-gold transition-all duration-500"
                      style={{ width: `${((surveyIndex) / SURVEY_QUESTIONS.length) * 100}%` }}
                    />
                  </div>

                  {/* Question Title */}
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-8 min-h-[70px] leading-tight">
                    {SURVEY_QUESTIONS[surveyIndex].question}
                  </h3>

                  {/* Options */}
                  <div className="flex flex-col gap-4">
                    {SURVEY_QUESTIONS[surveyIndex].options.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => {
                          const nextAnswers = [...surveyAnswers, option.key];
                          setSurveyAnswers(nextAnswers);
                          if (surveyIndex < SURVEY_QUESTIONS.length - 1) {
                            setSurveyIndex(surveyIndex + 1);
                          } else {
                            // Generar código de cupón de validación
                            const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
                            const today = new Date();
                            const dateStr = String(today.getDate()).padStart(2, "0") + String(today.getMonth() + 1).padStart(2, "0");
                            setSurveyCoupon(`VAL-OK-${dateStr}-${randomHex}`);
                          }
                        }}
                        className="group w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-r9-gold/30 rounded-2xl flex items-center gap-4 transition-all duration-300 cursor-pointer active:scale-98"
                      >
                        <span className="w-8 h-8 rounded-lg bg-r9-dark border border-white/10 group-hover:border-r9-gold/50 flex items-center justify-center font-black text-xs text-white/50 group-hover:text-r9-gold transition-all shrink-0">
                          {option.key}
                        </span>
                        <span className="text-sm font-semibold text-white/80 group-hover:text-white text-left transition-colors">
                          {option.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Recompensa / Gracias */
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-8">
                    <Trophy className="w-10 h-10 text-emerald-500 fill-emerald-500/20" />
                  </div>

                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none">
                    ¡PROYECTO VALIDADO!
                  </h3>
                  <p className="text-xs font-black text-r9-gold uppercase tracking-[0.4em] mb-8">
                    GRACIAS POR TU VALIOSO FEEDBACK
                  </p>

                  <p className="text-sm font-semibold text-white/50 mb-10 max-w-sm">
                    Tu feedback ha sido guardado exitosamente para mejorar el Tótem interactivo de Ruta 9. ¡Aquí tienes tu recompensa!
                  </p>

                  {/* Coupon Frame */}
                  <div className="w-full bg-black/60 border border-white/10 rounded-[2rem] p-6 relative overflow-hidden shadow-2xl mb-10">
                    <div className="absolute inset-0 bg-[#FFB800]/5 pointer-events-none" />
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] mb-2 font-black">CÓDIGO DE VALIDACIÓN</p>
                    <p className="text-3xl font-black tracking-widest text-[#FFB800] font-mono text-glow-gold select-all">{surveyCoupon}</p>
                    <p className="text-[8px] text-[#FFB800]/40 uppercase font-black mt-2.5 tracking-widest">🏆 MUESTRA O CANJEA EN CAJA PARA TU 10% DE DESCUENTO</p>
                  </div>

                  <button
                    onClick={() => setIsSurveyOpen(false)}
                    className="w-full py-5 bg-r9-red hover:bg-r9-red/90 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl active:scale-95 transition-all shadow-xl"
                  >
                    FINALIZAR Y VOLVER
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocker de Kiosco / Pantalla Completa Activa */}
      <AnimatePresence>
        {!isKioskStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={startKioskMode}
            className="fixed inset-0 z-[9999] bg-r9-dark flex flex-col items-center justify-center p-8 cursor-pointer select-none"
          >
            {/* Mesh de fondo animada */}
            <div className="absolute inset-0 bg-gradient-to-tr from-r9-red/10 via-black to-r9-gold/5 pointer-events-none" />
            <div className="noise-overlay pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
              {/* Logo / Emblema */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-40 h-40 bg-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-4 mb-10 border border-white/10"
              >
                <img src="/logo.png" alt="Ruta 9 Logo" className="w-full h-full object-contain scale-110" />
              </motion.div>

              {/* Título de Sistema */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-8">
                <span className="w-2.5 h-2.5 rounded-full bg-r9-gold animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">TÓTEM DIGITAL ACTIVO</span>
              </div>

              {/* Mensaje de Llamado de Acción */}
              <h2 className="text-7xl font-black italic uppercase tracking-tighter text-white mb-6 leading-none flex flex-col gap-2">
                <span className="text-glow-red text-r9-red">TOCA LA PANTALLA</span>
                <span className="text-5xl text-white/90">PARA INICIAR ARCADE</span>
              </h2>

              <p className="text-base font-semibold text-white/40 mb-12 tracking-wide max-w-md">
                Presiona cualquier parte de la pantalla para ingresar a la experiencia completa de juegos Ruta 9.
              </p>

              {/* Botón Pulsante Estilo Arcade */}
              <motion.div 
                animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 20px rgba(197,32,38,0.2)", "0 0 40px rgba(197,32,38,0.5)", "0 0 20px rgba(197,32,38,0.2)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full bg-r9-red flex items-center justify-center border-4 border-r9-gold/30 cursor-pointer shadow-lg"
              >
                <Play className="w-10 h-10 text-white fill-white ml-2 animate-pulse" />
              </motion.div>

              <p className="text-[10px] font-black text-r9-gold uppercase tracking-[0.6em] mt-10">
                PUNTA ARENAS • PATAGONIA CHILE
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      <footer className="fixed bottom-12 left-12 z-50">
        <div className="flex items-center gap-10">
          <div className="w-20 h-[2px] bg-gradient-to-r from-r9-red to-transparent opacity-30" />
          <div className="flex flex-col gap-2">
             <p className="text-xs font-black uppercase tracking-[0.6em] text-white/30 italic">
               RUTA 9 <span className="text-r9-red">EXCLUSIVE</span> EXPERIENCE
             </p>
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/10">
               Design by Patagonia Coach • Digital Totem Solutions
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
