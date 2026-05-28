import React, { useEffect, useState } from 'react';
import PrimaryButton from './PrimaryButton';
import { motion } from 'framer-motion';
import { calculateResult, generateCouponCode } from '../utils/gameLogic';
import { storage } from '../utils/storage';
import { Ticket, Share2, RefreshCcw } from 'lucide-react';
import { sounds } from '../utils/sounds';

export default function ResultScreen({ result, playerData, onReset }) {
  const [outcome, setOutcome] = useState(null);
  const [canInteract, setCanInteract] = useState(false);
  const hasSaved = React.useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanInteract(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleResetPress = (e) => {
    e.preventDefault();
    if (!canInteract) return;
    onReset();
  };

  const handleExitPress = (e) => {
    e.preventDefault();
    if (!canInteract) return;
    window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
  };

  useEffect(() => {
    if (hasSaved.current) return;
    
    const localRes = calculateResult(result);
    
    const resolveOutcome = async () => {
      // Si el resultado local es de pérdida, no hay necesidad de reclamar premio físico
      if (localRes.level === 'try-again') {
        setOutcome({ ...localRes, couponCode: "" });
        sounds.playGameResult(localRes.level);
        return;
      }

      try {
        const apiHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : '';
        const response = await fetch(`${apiHost}/api/claim-skill-prize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: "deten-el-9",
            playerName: playerData.name || "Invitado",
            receipt: playerData.receipt || "0000",
            skillSuccessful: true
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === "GANADOR") {
            setOutcome({
              score: localRes.score,
              message: "¡HAS GANADO!",
              prize: data.label,
              couponCode: data.couponCode,
              level: localRes.level
            });
            sounds.playGameResult(localRes.level);
            
            // Persistir jugada ganadora localmente
            storage.savePlay({
              id: Math.random().toString(36).substr(2, 9),
              playerName: playerData.name || "Invitado",
              receipt: playerData.receipt || "0000",
              stoppedTime: result,
              score: localRes.score,
              message: "¡HAS GANADO!",
              prize: data.label,
              couponCode: data.couponCode
            });
          } else {
            // Forzar pérdida si no queda stock
            const forcedLose = {
              score: 10,
              message: "¡Sigue participando!",
              prize: "Vuelve mañana por otro intento",
              level: "try-again",
              couponCode: ""
            };
            setOutcome(forcedLose);
            sounds.playGameResult("try-again");
          }
        } else {
          throw new Error('API falló');
        }
      } catch (err) {
        console.warn("⚠️ Error en reclamo de premio central. Usando base de datos de stock integrada en navegador.", err.message);
        
        // --- MOTOR DE STOCK CLIENT-SIDE (LOCALSTORAGE COMPARTIDO EN VERCEL) ---
        const getOrCreateLocalStock = () => {
          let stock = localStorage.getItem('r9_totem_stock');
          if (!stock) {
            const initialDb = {
              gameStock: {
                ruleta: { DESCUENTO_30: 1, DESCUENTO_20: 5, DESCUENTO_10: 20, HELADO_SOFT: 50, PAPAS_FRITAS: 8, SCHOP_BEBIDA: 6, REGALO_SORPRESA: 6 },
                "deten-el-9": { DESCUENTO_30: 20, DESCUENTO_20: 0, DESCUENTO_10: 0, HELADO_SOFT: 0, PAPAS_FRITAS: 0, SCHOP_BEBIDA: 0, REGALO_SORPRESA: 0 },
                "ruta-millonaria": { DESCUENTO_30: 0, DESCUENTO_20: 0, DESCUENTO_10: 0, HELADO_SOFT: 0, PAPAS_FRITAS: 0, SCHOP_BEBIDA: 0, REGALO_SORPRESA: 0 },
                "calza-burger": { DESCUENTO_30: 0, DESCUENTO_20: 2, DESCUENTO_10: 0, HELADO_SOFT: 13, PAPAS_FRITAS: 3, SCHOP_BEBIDA: 4, REGALO_SORPRESA: 5 },
                "memoria-burger": { DESCUENTO_30: 0, DESCUENTO_20: 1, DESCUENTO_10: 0, HELADO_SOFT: 13, PAPAS_FRITAS: 3, SCHOP_BEBIDA: 5, REGALO_SORPRESA: 5 }
              },
              blockRelease: {
                "1": { DESCUENTO_30: 1, DESCUENTO_20: 2, DESCUENTO_10: 4, HELADO_SOFT: 16, PAPAS_FRITAS: 4, SCHOP_BEBIDA: 4, REGALO_SORPRESA: 4 },
                "2": { DESCUENTO_30: 0, DESCUENTO_20: 2, DESCUENTO_10: 4, HELADO_SOFT: 16, PAPAS_FRITAS: 4, SCHOP_BEBIDA: 4, REGALO_SORPRESA: 4 },
                "3": { DESCUENTO_30: 0, DESCUENTO_20: 2, DESCUENTO_10: 4, HELADO_SOFT: 16, PAPAS_FRITAS: 4, SCHOP_BEBIDA: 4, REGALO_SORPRESA: 4 },
                "4": { DESCUENTO_30: 1, DESCUENTO_20: 2, DESCUENTO_10: 4, HELADO_SOFT: 16, PAPAS_FRITAS: 4, SCHOP_BEBIDA: 4, REGALO_SORPRESA: 4 },
                "5": { DESCUENTO_30: 0, DESCUENTO_20: 2, DESCUENTO_10: 4, HELADO_SOFT: 16, PAPAS_FRITAS: 4, SCHOP_BEBIDA: 4, REGALO_SORPRESA: 4 }
              },
              blockDelivered: {
                "1": { DESCUENTO_30: 0, DESCUENTO_20: 0, DESCUENTO_10: 0, HELADO_SOFT: 0, PAPAS_FRITAS: 0, SCHOP_BEBIDA: 0, REGALO_SORPRESA: 0 },
                "2": { DESCUENTO_30: 0, DESCUENTO_20: 0, DESCUENTO_10: 0, HELADO_SOFT: 0, PAPAS_FRITAS: 0, SCHOP_BEBIDA: 0, REGALO_SORPRESA: 0 },
                "3": { DESCUENTO_30: 0, DESCUENTO_20: 0, DESCUENTO_10: 0, HELADO_SOFT: 0, PAPAS_FRITAS: 0, SCHOP_BEBIDA: 0, REGALO_SORPRESA: 0 },
                "4": { DESCUENTO_30: 0, DESCUENTO_20: 0, DESCUENTO_10: 0, HELADO_SOFT: 0, PAPAS_FRITAS: 0, SCHOP_BEBIDA: 0, REGALO_SORPRESA: 0 },
                "5": { DESCUENTO_30: 0, DESCUENTO_20: 0, DESCUENTO_10: 0, HELADO_SOFT: 0, PAPAS_FRITAS: 0, SCHOP_BEBIDA: 0, REGALO_SORPRESA: 0 }
              }
            };
            localStorage.setItem('r9_totem_stock', JSON.stringify(initialDb));
            return initialDb;
          }
          return JSON.parse(stock);
        };

        const getLocalActiveBlock = () => {
          const now = new Date();
          const currentHour = now.getHours();
          if (currentHour < 12) return 1;
          if (currentHour >= 22) return 5;
          const blocks = [
            { id: 1, startHour: 12, endHour: 14 },
            { id: 2, startHour: 14, endHour: 16 },
            { id: 3, startHour: 16, endHour: 18 },
            { id: 4, startHour: 18, endHour: 20 },
            { id: 5, startHour: 20, endHour: 22 }
          ];
          const active = blocks.find(b => currentHour >= b.startHour && currentHour < b.endHour);
          return active ? active.id : 5;
        };

        const getLocalAvailableStock = (db, blockNum) => {
          const available = {
            DESCUENTO_30: 0, DESCUENTO_20: 0, DESCUENTO_10: 0, HELADO_SOFT: 0, PAPAS_FRITAS: 0, SCHOP_BEBIDA: 0, REGALO_SORPRESA: 0
          };
          for (let b = 1; b <= blockNum; b++) {
            const released = db.blockRelease[b.toString()];
            const delivered = db.blockDelivered[b.toString()];
            if (released) {
              for (const category in available) {
                available[category] += (released[category] || 0) - (delivered[category] || 0);
              }
            }
          }
          for (const category in available) {
            available[category] = Math.max(0, available[category]);
          }
          return available;
        };

        const localDb = getOrCreateLocalStock();
        const localBlock = getLocalActiveBlock();
        const localBlockStock = getLocalAvailableStock(localDb, localBlock);
        const gameStock = localDb.gameStock["deten-el-9"];

        // Dependiendo del resultado de precisión, se eligen mejores premios
        let allowedPrizes = [];
        if (localRes.level === "perfect") {
          allowedPrizes = ["DESCUENTO_30"];
        }

        // Filtrar por stock
        const possiblePrizes = allowedPrizes.filter(prize => {
          return gameStock[prize] > 0 && localBlockStock[prize] > 0;
        });

        if (possiblePrizes.length === 0) {
          const forcedLose = {
            score: 10,
            message: "¡Sigue participando!",
            prize: "Vuelve mañana por otro intento",
            level: "try-again",
            couponCode: ""
          };
          setOutcome(forcedLose);
          sounds.playGameResult("try-again");
          return;
        }

        const selectedPrizeId = "DESCUENTO_30";
        // Descontar stock
        localDb.gameStock["deten-el-9"][selectedPrizeId]--;
        localDb.blockDelivered[localBlock.toString()][selectedPrizeId]++;
        localStorage.setItem('r9_totem_stock', JSON.stringify(localDb));

        const PRIZE_LABELS = {
          "DESCUENTO_30": "30% DE DESCUENTO"
        };

        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const coupon = `R9-GANASTE-30DESCUENTO-${day}${month}-${randomStr}`;
        
        setOutcome({
          score: localRes.score,
          message: "¡HAS GANADO!",
          prize: PRIZE_LABELS[selectedPrizeId],
          couponCode: coupon,
          level: localRes.level
        });
        sounds.playGameResult(localRes.level);
        
        storage.savePlay({
          id: Math.random().toString(36).substr(2, 9),
          playerName: playerData.name || "Invitado",
          receipt: playerData.receipt || "0000",
          stoppedTime: result,
          score: localRes.score,
          message: "¡HAS GANADO!",
          prize: PRIZE_LABELS[selectedPrizeId],
          couponCode: coupon
        });
      }
    };

    resolveOutcome();
    hasSaved.current = true;
  }, [result, playerData]);

  if (!outcome) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col justify-between py-8"
    >
      <div className="text-center space-y-12">
        <div className="space-y-4">
          <p className="text-white/40 uppercase font-black tracking-[0.3em] text-sm">Resultado Final</p>
          <h2 className="text-9xl font-black text-white italic tracking-tighter">{result.toFixed(3)}s</h2>
        </div>

        <div className="py-10 px-6 bg-r9-charcoal/50 rounded-[40px] border-4 border-r9-gold relative overflow-hidden">
            {(outcome.level === 'perfect' || outcome.level === 'excellent') && (
                <div className="absolute inset-0 bg-r9-gold/5 animate-pulse pointer-events-none" />
            )}
            <h3 className="text-xl font-black text-r9-gold uppercase mb-3 tracking-wider">{outcome.message}</h3>
            <div className="space-y-2">
                <p className="text-3xl font-black text-white uppercase leading-tight tracking-tight px-2">{outcome.prize}</p>
                {outcome.couponCode ? (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-1.5 font-bold">CÓDIGO DE VALIDACIÓN</p>
                    <p className="text-2xl font-mono font-black text-[#FFB800] tracking-widest select-all mb-3">{outcome.couponCode}</p>
                    <p className="text-white/60 text-[9px] font-black uppercase tracking-widest leading-none">🍔 ¡Feliz Día de la Hamburguesa! 🍔</p>
                  </div>
                ) : (
                  <p className="text-sm font-light text-white/40 uppercase tracking-widest mt-1">Intenta nuevamente</p>
                )}
            </div>
        </div>

        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-sm text-white/40 italic">Muestra esta pantalla al personal de <br/> <span className="text-r9-red font-bold not-italic">Ruta9</span> para validar tus tickets.</p>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onPointerDown={handleResetPress}
          className={`w-full py-5 sm:py-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest transition-all active:scale-95 bg-[#C52026] text-white border-2 border-[#C52026] shadow-[0_10px_25px_rgba(197,32,38,0.4)] cursor-pointer select-none touch-none ${!canInteract ? 'opacity-50' : 'hover:bg-[#C52026]/90'}`}
        >
          NUEVO JUEGO
        </button>
        <button 
          onPointerDown={handleExitPress}
          className={`w-full py-5 sm:py-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest transition-all active:scale-95 bg-transparent text-white/20 border-2 border-white/5 cursor-pointer select-none touch-none ${!canInteract ? 'opacity-50' : 'hover:text-white/40 hover:bg-white/5'}`}
        >
          VOLVER A JUEGOS
        </button>
        <p className="text-[10px] text-center text-white/20 uppercase tracking-widest pt-2">
           Tótem Digital Ruta 9
        </p>
      </div>
    </motion.div>
  );
}
