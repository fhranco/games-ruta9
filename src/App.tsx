"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Trophy, Star, Zap, Flame, Ghost, Gamepad2, ChevronRight } from "lucide-react";

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

export default function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-inter gradient-mesh">
      <div className="noise-overlay" />

      {/* Header Bar */}
      <header className="fixed top-0 left-0 w-full z-50 p-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(209,35,43,0.4)]">
            <Gamepad2 className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">ARCADE RUTA 9</h1>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.4em] mt-1">Experience Collection v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Servidor Activo</span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="w-full h-full pt-32 px-12 pb-12 overflow-y-auto overflow-x-hidden scroll-smooth">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={() => setActiveGame(game.id)}
                className="group relative w-full aspect-[4/3] bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center p-8 transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
              >
                {/* Game Icon Container */}
                <div className="relative z-10 w-24 h-24 rounded-3xl bg-black/40 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                  {game.icon}
                </div>

                {/* Info */}
                <div className="relative z-10 text-center mt-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2 group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-sm font-medium text-white/40 max-w-[240px]">
                    {game.description}
                  </p>
                </div>

                {/* Launch Button Overlay */}
                <div className="absolute bottom-8 right-8 w-14 h-14 rounded-full bg-primary flex items-center justify-center translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_10px_30px_rgba(209,35,43,0.5)]">
                  <Play className="text-white fill-current w-6 h-6 ml-1" />
                </div>

                {/* Background Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                  style={{ background: `radial-gradient(circle at center, ${game.color}, transparent 70%)` }}
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
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[1000] bg-black"
          >
            {/* Control Bar */}
            <div className="absolute top-8 right-8 z-[1010] flex items-center gap-4">
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Jugando:</span>
                <span className="text-xs font-black uppercase italic tracking-wider text-primary">
                  {GAMES.find(g => g.id === activeGame)?.name}
                </span>
              </div>
              
              <button
                onClick={() => setActiveGame(null)}
                className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-[0_0_30px_rgba(209,35,43,0.4)]"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <iframe
              src={`/games/${activeGame}/index.html`}
              className="w-full h-full border-none shadow-2xl"
              title="Game Content"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      <footer className="fixed bottom-8 left-8 z-50">
        <div className="flex flex-col gap-2">
          <div className="w-8 h-[1px] bg-primary/40" />
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 italic">
            Powered by <span className="text-white/40">Agencia Patagoniacoach</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
