import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/sounds';
import { Timer, CheckCircle2, Flame, Sparkles } from 'lucide-react';

// Confetti nativo premium con los colores de la marca Ruta 9 (Rojo, Oro, Negro, Blanco)
function launchConfetti({ x = window.innerWidth / 2, y = window.innerHeight / 2, count = 90, colors = ['#FFB800', '#D21F2D', '#EA580C', '#FFFFFF', '#1E293B'] } = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const particles = Array.from({ length: count }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 16,
    vy: (Math.random() - 0.95) * 18,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    opacity: 1,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));

  let frame;
  const gravity = 0.42;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.014;
      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });
    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frame);
      canvas.remove();
    }
  };
  frame = requestAnimationFrame(animate);
}

// 8 Parejas de Ingredientes Gourmet
const INGREDIENTS = [
  { id: 'burger', emoji: '🍔', name: 'BURGER R9', color: 'from-amber-500 to-orange-600', neon: '#FFB800' },
  { id: 'meat', emoji: '🥩', name: 'CARNE PREMIUM', color: 'from-red-500 to-rose-700', neon: '#D21F2D' },
  { id: 'cheese', emoji: '🧀', name: 'CHEDDAR FUNDIDO', color: 'from-yellow-300 to-amber-500', neon: '#FFB800' },
  { id: 'bacon', emoji: '🥓', name: 'PANCETA CROC', color: 'from-orange-500 to-red-600', neon: '#F97316' },
  { id: 'fries', emoji: '🍟', name: 'PAPAS FRITAS', color: 'from-yellow-400 to-amber-600', neon: '#EAB308' },
  { id: 'avocado', emoji: '🥑', name: 'PALTA FRESCA', color: 'from-emerald-400 to-green-600', neon: '#10B981' },
  { id: 'tomato', emoji: '🍅', name: 'TOMATE FRESCO', color: 'from-red-400 to-rose-600', neon: '#EF4444' },
  { id: 'lettuce', emoji: '🥬', name: 'LECHUGA ORG', color: 'from-green-400 to-emerald-600', neon: '#34D399' }
];

export default function MemoryGame({ onStop, timeLimit }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shakeIndices, setShakeIndices] = useState([]);
  const [glowIndices, setGlowIndices] = useState([]);
  
  const timerRef = useRef(null);
  const flippedIndicesRef = useRef([]);

  useEffect(() => {
    const list = [...INGREDIENTS, ...INGREDIENTS].map((item, index) => ({
      ...item,
      uniqueId: `${item.id}-${index}`,
      index
    }));

    // Mezclar
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    const shuffled = list.map((item, idx) => ({ ...item, index: idx }));
    setCards(shuffled);
    
    sounds.announce("¡Memoria Burger! Encuentra las parejas antes que se enfríe la plancha.");

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            sounds.playLose();
            onStop(matchedPairs.length);
            return 0;
          }
          if (prev <= 10) {
            sounds.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, matchedPairs.length]);

  const handleCardTap = (idx) => {
    if (isProcessing) return;
    if (flippedIndicesRef.current.includes(idx) || matchedPairs.includes(cards[idx].id)) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    sounds.playTap();
    flippedIndicesRef.current.push(idx);
    setFlippedIndices([...flippedIndicesRef.current]);

    if (flippedIndicesRef.current.length === 2) {
      setIsProcessing(true);
      const [firstIdx, secondIdx] = flippedIndicesRef.current;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.id === secondCard.id) {
        // MATCH!
        setTimeout(() => {
          setMatchedPairs(prev => {
            const next = [...prev, firstCard.id];
            setGlowIndices([firstIdx, secondIdx]);
            sounds.playMatch();
            
            launchConfetti({
              x: window.innerWidth / 2,
              y: window.innerHeight / 3,
              count: 45
            });

            if (next.length === 8) {
              clearInterval(timerRef.current);
              sounds.playWin();
              setTimeout(() => {
                onStop(8);
              }, 1200);
            }

            return next;
          });

          flippedIndicesRef.current = [];
          setFlippedIndices([]);
          setIsProcessing(false);
          setTimeout(() => setGlowIndices([]), 600);
        }, 300);
      } else {
        // MISMATCH!
        setTimeout(() => {
          setShakeIndices([firstIdx, secondIdx]);
          sounds.playWrong();

          setTimeout(() => {
            flippedIndicesRef.current = [];
            setFlippedIndices([]);
            setShakeIndices([]);
            setIsProcessing(false);
          }, 800);
        }, 300);
      }
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-between items-center p-2 relative overflow-hidden select-none">
      
      {/* HUD Superior Holográfico con los Colores de Marca (Rojo y Oro) */}
      <div className="w-full bg-slate-900/90 border-2 border-r9-red/40 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_30px_rgba(210,31,45,0.2)] z-20 shrink-0">
        
        {/* Parejas encontradas */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-r9-gold/10 border border-r9-gold/40 flex items-center justify-center text-r9-gold shadow-[0_0_15px_rgba(255,184,0,0.25)]">
            <CheckCircle2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">PAREJAS</p>
            <p className="text-xl font-black text-white leading-tight">
              <span className="text-r9-gold text-glow-amber">{matchedPairs.length}</span>
              <span className="text-white/30 font-medium text-sm"> / 8</span>
            </p>
          </div>
        </div>

        {/* Barra de Progreso Central en Degrade R9 */}
        <div className="flex-1 max-w-[200px] mx-4 hidden md:block">
          <div className="h-2 bg-slate-950 border border-white/5 rounded-full overflow-hidden p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-r9-red via-orange-500 to-r9-gold rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,184,0,0.5)]"
              style={{ width: `${(matchedPairs.length / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* LED Timer R9 */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">TIEMPO</p>
            <p className={`text-xl font-black tracking-widest font-mono leading-tight transition-colors duration-300 ${
              timeLeft <= 10 ? 'text-r9-red text-glow-red animate-pulse' : 'text-r9-gold text-glow-amber'
            }`}>
              {String(timeLeft).padStart(2, '0')}s
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border-2 ${
            timeLeft <= 10 
              ? 'bg-r9-red/10 border-r9-red/40 text-r9-red shadow-[0_0_15px_rgba(210,31,45,0.2)]' 
              : 'bg-r9-gold/10 border-r9-gold/30 text-r9-gold'
          }`}>
            <Timer className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Grid del Tablero de Memoria (4x4) */}
      <div className="w-full flex-1 max-h-[500px] flex items-center justify-center p-2 z-10">
        <div className="grid grid-cols-4 gap-3 w-full max-w-[480px] aspect-square">
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx);
            const isMatched = matchedPairs.includes(card.id);
            const isShake = shakeIndices.includes(idx);
            const isGlow = glowIndices.includes(idx);

            return (
              <div
                key={card.uniqueId}
                onPointerDown={() => handleCardTap(idx)}
                className="relative perspective-800 cursor-pointer aspect-square w-full select-none"
              >
                <motion.div
                  className="w-full h-full relative preserve-3d"
                  animate={{
                    rotateY: (isFlipped || isMatched) ? 180 : 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 16
                  }}
                  style={{ width: '100%', height: '100%' }}
                >
                  
                  {/* REVERSO: Plancha Metálica Cyber-Grill R9 con Letrero de Neón en Bordes */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-[inset_0_2px_8px_rgba(255,255,255,0.03),_0_8px_16px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center overflow-hidden group hover:border-r9-gold/40 active:scale-95 transition-all">
                    
                    {/* Rejilla de plancha caliente */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                    
                    {/* Circuito de línea digital neón R9 */}
                    <div className="absolute inset-x-2 top-2 h-[1px] bg-gradient-to-r from-transparent via-r9-gold/10 to-transparent" />
                    <div className="absolute inset-x-2 bottom-2 h-[1px] bg-gradient-to-r from-transparent via-r9-red/10 to-transparent" />
                    
                    {/* Sello R9 Central Metálico Calentado */}
                    <div className="w-14 h-14 rounded-full border border-white/5 bg-slate-950 flex items-center justify-center shadow-[inset_0_1px_5px_rgba(0,0,0,0.8)] relative group-hover:scale-110 transition-transform duration-300">
                      <div className="absolute inset-0 rounded-full bg-r9-red/5 blur-[2px] group-hover:bg-r9-gold/10 transition-colors" />
                      <span className="text-xl font-black text-slate-700 group-hover:text-r9-gold transition-colors tracking-tighter text-glow-amber">R9</span>
                    </div>

                    <div className="absolute bottom-2 text-[7px] font-black text-r9-red/35 tracking-[0.25em] uppercase">CYBER GRILL</div>
                  </div>

                  {/* ANVERSO: Carta Revelada Holográfica con Efecto Scanner Digital Dorado y Emojis de Alta Gama */}
                  <div 
                    className={`absolute inset-0 backface-hidden rounded-2xl rotate-y-180 flex flex-col items-center justify-center p-2 border-2 shadow-[0_10px_25px_rgba(0,0,0,0.7)] overflow-hidden
                      ${isGlow 
                        ? 'bg-emerald-950/90 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-pulse' 
                        : isShake 
                          ? 'bg-red-950/90 border-r9-red shadow-[0_0_30px_rgba(210,31,45,0.5)] animate-shake'
                          : isMatched
                            ? 'bg-slate-900 border-r9-gold shadow-[0_0_20px_rgba(255,184,0,0.3)] opacity-90'
                            : 'bg-slate-900 border-r9-gold shadow-[0_0_25px_rgba(255,184,0,0.35)]'
                      }`}
                  >
                    
                    {/* Brillo gradiente radial de marca */}
                    <div 
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at center, ${card.neon}, transparent 70%)`
                      }}
                    />

                    {/* Scanner Digital circular premium */}
                    <div className="absolute w-24 h-24 pointer-events-none opacity-40 z-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_15s_linear_infinite]">
                        <circle cx="50" cy="50" r="45" stroke={isGlow ? "#10B981" : isShake ? "#D21F2D" : "#FFB800"} strokeWidth="1" fill="none" strokeDasharray="5, 3" />
                        <circle cx="50" cy="50" r="38" stroke={isGlow ? "#10B981" : isShake ? "#D21F2D" : "#FFB800"} strokeWidth="0.5" fill="none" strokeDasharray="10, 15" />
                        <path d="M 50,5 A 45,45 0 0,1 95,50" stroke={card.neon} strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>

                    {/* Emoji Gigante */}
                    <span className={`text-4xl z-10 drop-shadow-[0_0_12px_rgba(255,255,255,0.45)] ${
                      isMatched ? 'scale-95' : 'animate-bounce'
                    }`}>
                      {card.emoji}
                    </span>

                    {/* Etiqueta Inferior Holográfica R9 */}
                    <div className="absolute bottom-2 inset-x-2 bg-slate-950/80 border border-white/10 rounded-md py-0.5 text-center z-10 backdrop-blur-sm shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      <span className={`text-[7.5px] font-black tracking-widest block uppercase truncate ${
                        isMatched ? 'text-r9-gold text-glow-amber' : 'text-white'
                      }`} style={{ color: !isMatched ? card.neon : undefined }}>
                        {card.name}
                      </span>
                    </div>

                  </div>

                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer del Juego */}
      <div className="text-center py-2 z-10 shrink-0">
        <p className="text-[9px] font-black tracking-[0.25em] text-slate-600 uppercase">
          {gameStarted ? "🔥 ¡ENCUENTRA LAS PAREJAS RÁPIDAMENTE! 🔥" : "👉 TOCA CUALQUIER CARTA PARA EMPEZAR EL RELOJ"}
        </p>
      </div>

    </div>
  );
}
