import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/sounds';
import { RefreshCcw, CheckCircle2, AlertTriangle } from 'lucide-react';

// Confetti nativo con Canvas API - sin dependencias externas
function launchConfetti({ x = window.innerWidth / 2, y = window.innerHeight / 2, count = 80, colors = ['#FFB800','#D21F2D','#10B981','#FFFFFF','#EC4899'] } = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const particles = Array.from({ length: count }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 14,
    vy: (Math.random() - 0.9) * 16,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 8,
    opacity: 1,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));

  let frame;
  const gravity = 0.45;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.012;
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

const INGREDIENTS = [
  { 
    id: 1, 
    name: "Carne R9", 
    icon: "🥩", 
    color: "#EF4444", 
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.65)] hover:shadow-[0_0_30px_rgba(239,68,68,0.85)]",
    styleClass: "bg-gradient-to-b from-stone-700 to-stone-900 border-stone-600 shadow-[inset_0_4px_4px_rgba(255,255,255,0.1),_0_6px_10px_rgba(0,0,0,0.6)] text-amber-200" 
  },
  { 
    id: 2, 
    name: "Cheddar", 
    icon: "🧀", 
    color: "#FBBF24", 
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.65)] hover:shadow-[0_0_30px_rgba(245,158,11,0.85)]",
    styleClass: "bg-gradient-to-b from-yellow-300 to-amber-500 border-yellow-200 shadow-[0_4px_12px_rgba(245,158,11,0.4)] text-stone-900" 
  },
  { 
    id: 3, 
    name: "Gouda", 
    icon: "🧈", 
    color: "#F5F5F7", 
    glow: "shadow-[0_0_20px_rgba(255,255,255,0.55)] hover:shadow-[0_0_30px_rgba(255,255,255,0.75)]",
    styleClass: "bg-gradient-to-b from-slate-100 to-slate-300 border-white shadow-[0_4px_12px_rgba(255,255,255,0.3)] text-stone-900" 
  },
  { 
    id: 4, 
    name: "Tocino", 
    icon: "🥓", 
    color: "#EF4444", 
    glow: "shadow-[0_0_20px_rgba(220,38,38,0.55)] hover:shadow-[0_0_30px_rgba(220,38,38,0.75)]",
    styleClass: "bg-gradient-to-r from-red-600 to-rose-800 border-red-500 shadow-[0_4px_10px_rgba(220,38,38,0.3)] text-white" 
  },
  { 
    id: 5, 
    name: "Huevo Frito", 
    icon: "🍳", 
    color: "#FFFFFF", 
    glow: "shadow-[0_0_20px_rgba(255,255,255,0.65)] hover:shadow-[0_0_30px_rgba(255,255,255,0.85)]",
    styleClass: "bg-gradient-to-r from-amber-100 via-white to-amber-200 border-amber-300 shadow-[0_4px_12px_rgba(255,255,255,0.4)] text-stone-900" 
  },
  { 
    id: 6, 
    name: "Lechuga", 
    icon: "🥬", 
    color: "#10B981", 
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.55)] hover:shadow-[0_0_30px_rgba(16,185,129,0.75)]",
    styleClass: "bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-300 shadow-[0_4px_10px_rgba(16,185,129,0.3)] text-white" 
  },
  { 
    id: 7, 
    name: "Tomate", 
    icon: "🍅", 
    color: "#EF4444", 
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.65)] hover:shadow-[0_0_30px_rgba(239,68,68,0.85)]",
    styleClass: "bg-gradient-to-b from-red-500 to-rose-600 border-red-400 shadow-[0_4px_10px_rgba(239,68,68,0.3)] text-white" 
  },
  { 
    id: 8, 
    name: "Cebolla M.", 
    icon: "🧅", 
    color: "#EC4899", 
    glow: "shadow-[0_0_20px_rgba(236,72,153,0.65)] hover:shadow-[0_0_30px_rgba(236,72,153,0.85)]",
    styleClass: "bg-gradient-to-b from-fuchsia-500 to-purple-700 border-fuchsia-400 shadow-[0_4px_10px_rgba(236,72,153,0.3)] text-white" 
  },
  { 
    id: 9, 
    name: "Caramelizada", 
    icon: "🧄", 
    color: "#F59E0B", 
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.55)] hover:shadow-[0_0_30px_rgba(245,158,11,0.75)]",
    styleClass: "bg-gradient-to-b from-amber-600 to-orange-800 border-amber-500 shadow-[0_4px_10px_rgba(245,158,11,0.3)] text-amber-100" 
  },
  { 
    id: 10, 
    name: "Aros Cebolla", 
    icon: "⭕", 
    color: "#F59E0B", 
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.55)] hover:shadow-[0_0_30px_rgba(245,158,11,0.75)]",
    styleClass: "bg-gradient-to-b from-yellow-500 to-amber-600 border-yellow-400 shadow-[0_4px_10px_rgba(245,158,11,0.3)] text-stone-900" 
  },
  { 
    id: 11, 
    name: "Palta", 
    icon: "🥑", 
    color: "#10B981", 
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.55)] hover:shadow-[0_0_30px_rgba(16,185,129,0.75)]",
    styleClass: "bg-gradient-to-b from-lime-400 to-emerald-600 border-lime-300 shadow-[0_4px_10px_rgba(16,185,129,0.3)] text-white" 
  },
  { 
    id: 12, 
    name: "Pepinillos", 
    icon: "🥒", 
    color: "#10B981", 
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.55)] hover:shadow-[0_0_30px_rgba(16,185,129,0.75)]",
    styleClass: "bg-gradient-to-b from-green-600 to-emerald-800 border-green-500 shadow-[0_4px_10px_rgba(22,163,74,0.3)] text-white" 
  }
];

const RECIPES = [
  {
    id: "R1",
    name: "Burger Completa",
    ingredients: [1, 3, 6, 7, 8, 5],
    description: "Carne R9 🥩, Gouda 🧈, Lechuga 🥬, Tomate 🍅, Cebolla Morada 🧅, Huevo Frito 🍳"
  },
  {
    id: "R2",
    name: "Clásica BBQ",
    ingredients: [1, 2, 4, 5, 12],
    description: "Carne R9 🥩, Cheddar 🧀, Tocino 🥓, Huevo Frito 🍳, Pepinillos 🥒"
  },
  {
    id: "R3",
    name: "BBQ Tocino",
    ingredients: [1, 2, 4, 10],
    description: "Carne R9 🥩, Cheddar 🧀, Tocino 🥓, Aros de Cebolla ⭕"
  },
  {
    id: "R4",
    name: "La Gran S",
    ingredients: [1, 2, 4, 5, 11],
    description: "Carne R9 🥩, Cheddar 🧀, Tocino 🥓, Huevo Frito 🍳, Palta Trozada 🥑"
  },
  {
    id: "R5",
    name: "Club Veggie",
    ingredients: [2, 6, 7, 12],
    description: "Queso Cheddar 🧀, Lechuga 🥬, Tomate 🍅, Pepinillos 🥒"
  },
  {
    id: "R6",
    name: "La Francesa",
    ingredients: [1, 3, 9],
    description: "Carne R9 🥩, Queso Gouda 🧈, Cebolla Caramelizada 🧄"
  }
];

const CUSTOMERS = ["👨‍🍳", "👩‍🍳", "👨", "👩", "🦁", "🍔", "🤖", "👾"];

export default function BurgerMatcher({ onStop }) {
  const [phase, setPhase] = useState('building'); // 'building', 'feedback'
  const [timeLeft, setTimeLeft] = useState(45); // 45 segundos
  const [completedCount, setCompletedCount] = useState(0);
  const [targetRecipe, setTargetRecipe] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); 
  const [stackedIngredients, setStackedIngredients] = useState([]); 
  const [customerEmoji, setCustomerEmoji] = useState("👨‍🍳");
  const [flash, setFlash] = useState(null); 
  const [wrongIngredientId, setWrongIngredientId] = useState(null); 
  const [lastCorrectAdded, setLastCorrectAdded] = useState(false);

  const timerRef = useRef(null);
  // Cola de 3 recetas únicas y distintas para la partida
  const recipeQueueRef = useRef([]);
  const recipeIndexRef = useRef(0);

  // Genera una cola de 3 recetas distintas mezcladas
  const buildRecipeQueue = () => {
    const shuffled = [...RECIPES].sort(() => Math.random() - 0.5);
    recipeQueueRef.current = shuffled.slice(0, 3);
    recipeIndexRef.current = 0;
  };

  useEffect(() => {
    // Limpieza de seguridad por si hay doble render en desarrollo
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Generar la cola de 3 recetas únicas para esta partida
    buildRecipeQueue();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleGameOver(false);
          return 0;
        }
        if (prev <= 10) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    loadNextRecipe();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Carga la siguiente receta única de la cola pre-generada
  const loadNextRecipe = () => {
    const chosen = recipeQueueRef.current[recipeIndexRef.current];
    recipeIndexRef.current += 1;

    setTargetRecipe(chosen);
    setCurrentStepIndex(0);
    setStackedIngredients([]);
    setFlash(null);
    setWrongIngredientId(null);
    setLastCorrectAdded(false);

    const randomCustomer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    setCustomerEmoji(randomCustomer);

    const burgerNum = recipeIndexRef.current;
    sounds.announce(`¡Comanda ${burgerNum} de 3! Una ${chosen.name}.`);
  };

  // Omitir comanda: salta a la siguiente receta de la cola (no repite)
  const skipToNextRecipe = () => {
    if (recipeIndexRef.current < recipeQueueRef.current.length) {
      loadNextRecipe();
    } else {
      // Si ya se usaron las 3, regenerar una cola nueva
      buildRecipeQueue();
      loadNextRecipe();
    }
  };


  const handleIngredientTap = (id) => {
    if (phase !== 'building' || flash) return;

    const expectedIngredientId = targetRecipe.ingredients[currentStepIndex];

    if (id === expectedIngredientId) {
      sounds.playTap();
      const ingredient = INGREDIENTS.find(i => i.id === id);
      setStackedIngredients(prev => [...prev, ingredient]);
      
      setLastCorrectAdded(true);
      setTimeout(() => setLastCorrectAdded(false), 200);

      const nextStepIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextStepIndex);

      if (nextStepIndex === targetRecipe.ingredients.length) {
        handleBurgerComplete();
      }
    } else {
      // Sonido específico de ingrediente incorrecto (NO el de game over)
      sounds.playWrong();
      setFlash('error');
      setWrongIngredientId(id);
      
      // Penalización de -2 segundos
      setTimeLeft(prev => Math.max(0, prev - 2));

      setTimeout(() => {
        setFlash(null);
        setWrongIngredientId(null);
      }, 600);
    }
  };

  const handleBurgerComplete = () => {
    setPhase('feedback');
    setFlash('success');
    sounds.playMatch();
    sounds.announce('¡Burger perfecta! ¡Comanda despachada!');

    // Lanzar confetti desde el centro de la pantalla
    launchConfetti({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.55,
      count: 100,
    });

    const nextCompleted = completedCount + 1;
    setCompletedCount(nextCompleted);

    setTimeout(() => {
      setPhase('building');
      setFlash(null);

      if (nextCompleted >= 3) {
        clearInterval(timerRef.current);
        handleGameOver(true);
      } else {
        loadNextRecipe();
      }
    }, 1800);
  };

  const handleGameOver = (isVictory) => {
    setPhase('feedback');
    if (isVictory) {
      sounds.playWin();
    } else {
      sounds.playLose();
    }
    setTimeout(() => {
      onStop(isVictory ? 3 : completedCount);
    }, 1800);
  };

  return (
    <div className="flex flex-col items-center justify-between flex-1 h-full w-full py-1 relative select-none touch-none font-display">
      
      {/* HUD de alto impacto - Estilo Marcador de Carreras / Cyberpunk */}
      <div className="w-full flex justify-between items-center px-4 mb-2">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Cyber-Grill Arena</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black italic tracking-tighter text-glow-red text-r9-red">ARMA LA BURGER</span>
            <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black tracking-widest uppercase text-glow-emerald">META: 3</span>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Marcador Digital de Pedidos */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col items-end shrink-0">
            <span className="text-[7.5px] font-black text-slate-400 tracking-widest uppercase">ENTREGADAS</span>
            <div className="flex gap-1 mt-0.5">
              {[1, 2, 3].map(i => (
                <span 
                  key={i} 
                  className={`text-base leading-none transition-all duration-300 ${i <= completedCount ? 'opacity-100 scale-110 filter drop-shadow-[0_0_10px_#FFB800]' : 'opacity-15 grayscale'}`}
                >
                  🍔
                </span>
              ))}
            </div>
          </div>
          
          {/* Temporizador Digital de Plancha */}
          <div className={`border px-4 py-1.5 rounded-xl flex flex-col items-end shrink-0 transition-all duration-300 backdrop-blur-md
            ${timeLeft <= 15 ? 'bg-red-950/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-white/5 border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'}
          `}>
            <span className={`text-[7.5px] font-black tracking-widest uppercase flex items-center gap-1 ${timeLeft <= 15 ? 'text-red-400' : 'text-slate-400'}`}>
              ⏱️ TIEMPO
            </span>
            <span className={`text-base font-mono font-black ${timeLeft <= 15 ? 'text-red-400 text-glow-red animate-pulse' : 'text-amber-400 text-glow-amber'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Arena Cyber-Grill (Piedra Volcánica + Neón) - Responsiva y Flexible */}
      <div className={`relative bg-slate-950 border-2 border-slate-800 rounded-[2.5rem] p-4.5 shadow-[0_0_50px_rgba(0,0,0,0.8)] select-none touch-none w-[395px] flex-1 min-h-[580px] max-h-[740px] flex flex-col items-center justify-between overflow-hidden transition-all duration-300
        ${lastCorrectAdded ? 'bg-emerald-950/20 shadow-[0_0_40px_rgba(16,185,129,0.15)] border-emerald-900/50' : ''}
        ${flash === 'error' ? 'bg-red-950/20 shadow-[0_0_40px_rgba(239,68,68,0.15)] border-red-900/50' : ''}
      `}>
        
        {/* Luces de Neón Ambientales de fondo */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full opacity-20 blur-[80px] pointer-events-none transition-all duration-300
          ${lastCorrectAdded ? 'bg-emerald-500 opacity-30' : 'bg-amber-500'}`} 
        />
        
        {/* Fondo Gris Texturizado Estilo Piedra Volcánica */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/90 via-slate-950/95 to-black select-none pointer-events-none z-0" />

        <AnimatePresence mode="wait">
          {phase === 'building' && targetRecipe && (
            <motion.div 
              key="gameplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 w-full h-full flex flex-col justify-between z-10"
            >
              {/* Cliente y Thought Bubble / Cápsula del Pedido */}
              <div className="w-full flex items-start gap-3 relative z-20 shrink-0">
                {/* Avatar del cliente en círculo de neón */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center text-3xl shadow-xl shrink-0 select-none">
                  {customerEmoji}
                </div>

                {/* Cápsula del Pedido (Glassmorphism Espacial) */}
                <div className="flex-1 backdrop-blur-md bg-white/5 border border-white/10 p-2.5 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_10px_25px_rgba(0,0,0,0.5)] relative">
                  <div className="absolute -left-2 top-5 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-white/5" />
                  
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[8.5px] font-black tracking-widest text-amber-400 uppercase text-glow-amber">SIGUIENTE ORDEN:</span>
                    <span className="text-[9px] font-black text-slate-300 uppercase bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">{targetRecipe.name}</span>
                  </div>

                  {/* Receta visual detallada */}
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <span className="text-[9px] rounded px-1 py-0.5 bg-amber-900/40 text-amber-200 border border-amber-700/30">🍞 BASE</span>
                    {targetRecipe.ingredients.map((ingId, idx) => {
                      const ing = INGREDIENTS.find(i => i.id === ingId);
                      const isNext = idx === currentStepIndex;
                      return (
                        <div key={idx} className="flex items-center gap-0.5">
                          <span className="text-white/20 text-xs">➔</span>
                          <span 
                            className={`text-[11px] rounded px-1 py-0.5 transition-all duration-200 font-bold flex items-center gap-0.5
                              ${isNext ? 'scale-105 filter drop-shadow-[0_0_10px_#FFB800] bg-amber-400 text-slate-900 border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] font-black' : 'opacity-40 bg-white/5 text-white/70'}
                            `}
                          >
                            {ing?.icon} <span className="text-[7px] uppercase font-black tracking-wide ml-0.5">{ing?.name.split(" ")[0]}</span>
                          </span>
                        </div>
                      );
                    })}
                    <span className="text-white/20 text-xs">➔</span>
                    <span className="text-[9px] rounded px-1 py-0.5 bg-amber-900/40 text-amber-200 border border-amber-700/30 opacity-40">👑 TAPA</span>
                  </div>
                </div>
              </div>

              {/* Área Central: Plancha del Armado */}
              <div className={`flex-[0.95] w-full my-2.5 bg-slate-950/80 rounded-3xl border-2 border-slate-900 p-2.5 flex flex-col justify-end items-center relative overflow-hidden transition-all duration-200 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)]
                ${flash === 'error' ? 'border-red-500/30' : ''}
              `}>
                <div className="absolute top-1.5 text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">PLANCHA DE COCCIÓN A FUEGO DIRECTO</div>
                
                {/* Capas Stacking con Animación SlideUp Elástica */}
                <div className="w-64 flex flex-col-reverse justify-end items-center mb-1 gap-[-3px] z-10 scale-90 origin-bottom">
                  {/* Pan Inferior */}
                  <div className="w-56 h-8 bg-gradient-to-t from-amber-800 to-amber-600 border border-amber-500 rounded-full shadow-[0_6px_12px_rgba(0,0,0,0.6),_inset_0_2px_4px_rgba(255,255,255,0.2)] flex items-center justify-center text-white/90 font-black text-xs uppercase tracking-wider select-none">
                    🍞 BASE RUTA 9
                  </div>

                  <AnimatePresence>
                    {stackedIngredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className={`w-56 h-7 rounded-full border text-center text-white font-black text-xs 
                        flex items-center justify-center shadow-lg transform transition-all duration-300 animate-slide-up select-none
                        ${ing.styleClass}`}
                      >
                        {ing.icon} {ing.name.toUpperCase()}
                      </div>
                    ))}
                  </AnimatePresence>

                  {/* Pan Superior (Se despacha automáticamente al final) */}
                  {flash === 'success' && (
                    <div 
                      className="w-56 h-9 bg-gradient-to-b from-amber-500 to-amber-700 border border-amber-400 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5),_inset_0_2px_4px_rgba(255,255,255,0.3)] flex items-center justify-center text-white font-black text-xs uppercase tracking-widest select-none animate-slide-up"
                    >
                      👑 TAPA SUPREMA
                    </div>
                  )}
                </div>
              </div>

              {/* Botonera de Cocina Táctil Expandida (12 Botones de Impacto Neon en Matriz 4x3) */}
              <div className="grid grid-cols-4 gap-2 w-full py-1 shrink-0">
                {INGREDIENTS.map((ingredient) => {
                  const isWrong = wrongIngredientId === ingredient.id;

                  return (
                    <button
                      key={ingredient.id}
                      onPointerDown={() => handleIngredientTap(ingredient.id)}
                      className={`relative py-3.5 rounded-2xl flex flex-col items-center justify-center border font-black uppercase tracking-wider
                        transform active:scale-90 transition-all duration-100 cursor-pointer select-none text-white/90
                        backdrop-blur-md bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80
                        ${ingredient.glow}
                        ${isWrong ? 'border-red-500 bg-red-950/50 shadow-[0_0_25px_rgba(239,68,68,0.8)]' : ''}
                      `}
                    >
                      <span className="text-2xl select-none">{ingredient.icon}</span>
                      <span className="text-[7.5px] font-black tracking-widest mt-1 text-center truncate max-w-full px-1">
                        {ingredient.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* FASE 3: Feedback Acierto / Fallo */}
          {phase === 'feedback' && flash && (
            <motion.div 
              key="feedback-phase"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center z-10"
            >
              {flash === 'success' ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 rounded-full bg-emerald-950/60 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(16,185,129,0.6)] animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h3 className="text-4xl font-black italic uppercase leading-none tracking-tight text-emerald-400 text-glow-emerald">
                    ¡BURGER PERFECTA!
                  </h3>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest max-w-xs mx-auto">
                    Entregando comanda al cliente...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-24 h-24 rounded-full bg-red-950/60 border-2 border-red-500 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(239,68,68,0.6)] animate-bounce">
                    <AlertTriangle className="w-12 h-12 text-red-400" />
                  </div>
                  <h3 className="text-4xl font-black italic uppercase leading-none tracking-tight text-red-500 text-glow-red">
                    ¡ERROR DE RECETA!
                  </h3>
                  <p className="text-[11px] font-black text-red-400/80 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                    Penalización: <span className="text-white font-bold font-mono">-3 Segundos</span>
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Omitir comanda */}
      <div className="w-full px-4 mt-2 shrink-0">
        <button
          onPointerDown={() => {
            if (phase === 'building') {
              sounds.playTap();
              skipToNextRecipe();
            }
          }}
          className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 select-none touch-none cursor-pointer bg-slate-900 border border-slate-800 hover:border-amber-500/30 text-white active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <RefreshCcw size={12} /> OMITIR Y CAMBIAR CLIENTE
        </button>
      </div>
    </div>
  );
}
