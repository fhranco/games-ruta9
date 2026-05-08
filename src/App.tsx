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
    <div className="relative w-full h-screen overflow-hidden bg-r9-dark font-inter gradient-mesh">
      <div className="noise-overlay" />

      {/* Header Bar */}
      <header className="fixed top-0 left-0 w-full z-[100] p-12 flex justify-between items-start bg-gradient-to-b from-r9-dark via-r9-dark/80 to-transparent">
        <div className="flex items-center gap-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/10 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-44 h-44 bg-white rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-4 transition-transform duration-500 group-hover:scale-105">
              <img src="/logo.png" alt="Ruta 9 Logo" className="w-full h-full object-contain scale-110" />
            </div>
          </div>
          <div className="flex flex-col mt-4">
            <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-white flex flex-col gap-2">
              <span className="text-r9-red drop-shadow-[0_0_15px_rgba(197,32,38,0.4)]">ARCADE</span>
              <span className="text-4xl text-white/90">EXPERIENCE</span>
            </h1>
            <div className="flex flex-col gap-2 mt-6 ml-1">
              <p className="text-xs font-black text-r9-gold uppercase tracking-[0.8em]">
                SÁNDWICH • BAR • COCINA
              </p>
              <div className="w-20 h-1 bg-r9-brown/40" />
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">
                Punta Arenas • Chile
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 mt-4">
          <div className="bg-r9-charcoal/90 border border-white/10 px-8 py-4 rounded-2xl backdrop-blur-3xl shadow-2xl flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">ESTADO DEL TÓTEM</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase text-white/90">SISTEMA ONLINE</span>
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-pulse" />
              </div>
            </div>
          </div>
          <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mr-2">
            V2.4.0 • Totem Digital
          </p>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 w-full h-full pt-72 px-16 pb-24 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar">
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
            {/* Control Bar */}
            <div className="absolute top-12 right-12 z-[1010] flex items-center gap-8">
              <div className="bg-r9-charcoal/90 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-2xl flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">ESTÁS JUGANDO</span>
                  <span className="text-xl font-black uppercase italic tracking-wider text-r9-gold text-glow-gold">
                    {GAMES.find(g => g.id === activeGame)?.name}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setActiveGame(null)}
                className="w-20 h-20 bg-r9-red text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-[0_15px_40px_rgba(210,31,45,0.4)] group hover:rotate-90 duration-500"
              >
                <X className="w-10 h-10" />
              </button>
            </div>

            <iframe
              src={`games/${activeGame}/index.html`}
              className="w-full h-full border-none shadow-2xl bg-r9-dark"
              title="Game Content"
            />
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
