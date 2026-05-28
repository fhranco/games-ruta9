import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ROULETTE_PRIZES, selectWeightedPrize, calculateRotation } from '../utils/rouletteLogic';
import { sounds } from '../utils/sounds';

export default function RouletteWheel({ onFinished }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [tickTrigger, setTickTrigger] = useState(0);
  const controls = useAnimation();
  const lastTickAngle = useRef(0);

  const handleSpin = async (e) => {
    if (e) e.preventDefault();
    if (isSpinning) return;
    setIsSpinning(true);
    setTickTrigger(0);
    sounds.init();

    let resultIndex = 1; // Default: Sigue Jugando
    let resultPrize = { id: "SIGUE_PARTICIPANDO", label: "SIGUE JUGANDO", couponCode: "" };

    try {
      const apiHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : '';
      const response = await fetch(`${apiHost}/api/spin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: 'Invitado', receipt: '0000' })
      });

      if (response.ok) {
        const data = await response.json();
        resultIndex = data.index;
        resultPrize = {
          id: data.premio,
          label: data.label,
          couponCode: data.couponCode
        };
      } else {
        throw new Error('Error en API');
      }
    } catch (err) {
      console.warn('⚠️ Contingencia Offline: Usando base de datos de stock integrada en navegador.', err.message);
      
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
      const localRuletaStock = localDb.gameStock.ruleta;

      const ahora = new Date();
      const hora = ahora.getHours();
      const minutos = ahora.getMinutes();
      const minutosTotales = hora * 60 + minutos;
      
      // Ventana Peak: 16:30 - 20:00 (en minutos: 990 a 1200)
      const esPeak = (minutosTotales >= 990 && minutosTotales < 1200);
      const winRate = esPeak ? 0.35 : 0.25; // 35% en peak, 25% estándar
      const maxConsecutiveLossesAllowed = esPeak ? 3 : 5;
      
      let consecutiveLosses = parseInt(localStorage.getItem('r9_ruleta_consecutive_losses') || '0', 10);
      let isWinner = Math.random() < winRate;
      
      if (consecutiveLosses >= maxConsecutiveLossesAllowed) {
        isWinner = true;
        console.log(`🛡️ [RULETA OFFLINE] Forzando ganador por regla Anti-Sequía (Tiros perdidos seguidos: ${consecutiveLosses})`);
      }

      // Filtrar qué premios tienen stock real disponible en el bloque y en la ruleta
      const possiblePrizes = [];
      const prizeWeights = {
        HELADO_SOFT: 50,
        DESCUENTO_10: 25,
        PAPAS_FRITAS: 16,
        SCHOP_BEBIDA: 12,
        REGALO_SORPRESA: 12,
        DESCUENTO_20: 10,
        DESCUENTO_30: 2
      };

      for (const prize in localRuletaStock) {
        if (localRuletaStock[prize] > 0 && localBlockStock[prize] > 0) {
          possiblePrizes.push({
            id: prize,
            weight: prizeWeights[prize] || 10
          });
        }
      }

      // Si no quedan premios con stock físico, forzar "Sigue Jugando"
      if (!isWinner || possiblePrizes.length === 0) {
        if (possiblePrizes.length > 0) {
          localStorage.setItem('r9_ruleta_consecutive_losses', (consecutiveLosses + 1).toString());
        }
        const losingIndices = [1, 3, 5];
        resultIndex = losingIndices[Math.floor(Math.random() * losingIndices.length)];
        resultPrize = { id: "SIGUE_PARTICIPANDO", label: "SIGUE JUGANDO", couponCode: "" };
      } else {
        // Reset de pérdidas
        localStorage.setItem('r9_ruleta_consecutive_losses', '0');

        // Selección ponderada de stock
        const totalWeight = possiblePrizes.reduce((sum, p) => sum + p.weight, 0);
        let r = Math.random() * totalWeight;
        let selectedPrizeId = possiblePrizes[0].id;
        for (const p of possiblePrizes) {
          r -= p.weight;
          if (r <= 0) {
            selectedPrizeId = p.id;
            break;
          }
        }

        // Mapear segmentos
        const PRIZE_LABELS = {
          "DESCUENTO_30": "30% DE DESCUENTO",
          "DESCUENTO_20": "20% DE DESCUENTO",
          "DESCUENTO_10": "10% DE DESCUENTO",
          "HELADO_SOFT": "HELADO SOFT GRATIS",
          "PAPAS_FRITAS": "PAPAS FRITAS GRATIS",
          "SCHOP_BEBIDA": "BEBIDA O SCHOP GRATIS",
          "REGALO_SORPRESA": "REGALO SORPRESA R9"
        };

        if (selectedPrizeId.startsWith("DESCUENTO")) {
          resultIndex = 0;
        } else if (selectedPrizeId === "HELADO_SOFT") {
          resultIndex = 2;
        } else if (selectedPrizeId === "PAPAS_FRITAS") {
          resultIndex = 4;
        } else if (selectedPrizeId === "SCHOP_BEBIDA") {
          resultIndex = 6;
        } else if (selectedPrizeId === "REGALO_SORPRESA") {
          resultIndex = 7;
        }

        // Descontar de localStorage
        localDb.gameStock.ruleta[selectedPrizeId]--;
        localDb.blockDelivered[localBlock.toString()][selectedPrizeId]++;
        localStorage.setItem('r9_totem_stock', JSON.stringify(localDb));

        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        
        let prizeLabel = "RULETA";
        if (selectedPrizeId.includes("DESCUENTO_30")) prizeLabel = "30DESCUENTO";
        else if (selectedPrizeId.includes("DESCUENTO_20")) prizeLabel = "20DESCUENTO";
        else if (selectedPrizeId.includes("DESCUENTO_10")) prizeLabel = "10DESCUENTO";
        else if (selectedPrizeId.includes("HELADO_SOFT")) prizeLabel = "HELADO";
        else if (selectedPrizeId.includes("PAPAS_FRITAS")) prizeLabel = "PAPAS";
        else if (selectedPrizeId.includes("SCHOP_BEBIDA")) prizeLabel = "BEBIDA";
        else if (selectedPrizeId.includes("REGALO_SORPRESA")) prizeLabel = "SORPRESA";
        
        const coupon = `R9-GANASTE-${prizeLabel}-${day}${month}-${randomStr}`;

        resultPrize = {
          id: selectedPrizeId,
          label: PRIZE_LABELS[selectedPrizeId],
          couponCode: coupon
        };
      }
    }

    const targetRotation = calculateRotation(resultIndex);
    const segmentAngle = 360 / ROULETTE_PRIZES.length;

    sounds.playSpin(6);

    await controls.start({
      rotate: targetRotation,
      transition: {
        duration: 6,
        ease: [0.15, 0, 0.1, 1],
        onUpdate: (latest) => {
          const currentRotation = latest.rotate;
          if (Math.floor(currentRotation / segmentAngle) > Math.floor(lastTickAngle.current / segmentAngle)) {
            sounds.playTick();
            lastTickAngle.current = currentRotation;
            setTickTrigger(prev => prev + 1);
          }
        }
      }
    });

    setTimeout(() => {
      sounds.playWin();
      onFinished(resultPrize);
      setIsSpinning(false);
      lastTickAngle.current = 0;
    }, 500);
  };

  // Generador de segmentos SVG reducidos para dar espacio al bisel metálico perimetral (radio 182)
  const renderSegments = () => {
    const numSegments = ROULETTE_PRIZES.length;
    const angleStep = 360 / numSegments;
    
    return ROULETTE_PRIZES.map((prize, i) => {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;
      
      const x1 = 200 + 182 * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = 200 + 182 * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = 200 + 182 * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = 200 + 182 * Math.sin((Math.PI * (endAngle - 90)) / 180);
      
      const pathData = `M 200 200 L ${x1} ${y1} A 182 182 0 0 1 ${x2} ${y2} Z`;
      
      return (
        <g key={i}>
          <path d={pathData} fill={prize.color} stroke="#0A0A0A" strokeWidth="1.5" />
          <g transform={`rotate(${startAngle + angleStep / 2}, 200, 200)`}>
            <text
              x="200"
              y="90"
              fill="white"
              stroke="#0A0A0A"
              strokeWidth="2.5"
              fontSize="13"
              fontWeight="900"
              textAnchor="middle"
              transform="rotate(-90, 200, 90)"
              style={{ 
                textTransform: 'uppercase', 
                letterSpacing: '-0.02em',
                paintOrder: 'stroke fill'
              }}
            >
              {prize.label}
            </text>
          </g>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-16 py-8">
      <div className="relative">
        {/* Marcador Superior Mecánico con Rebote de Resorte */}
        <motion.div
          key={tickTrigger}
          initial={{ rotate: 0 }}
          animate={{
            rotate: isSpinning 
              ? [24, -10, 4, 0] // Oscilación física al colisionar con un perno
              : [0, 0]
          }}
          transition={{
            type: "spring",
            stiffness: 650,
            damping: 10,
            mass: 0.8
          }}
          style={{
            originX: "50%",
            originY: "16.6%",
          }}
          className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 w-16 h-24 pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
        >
          <svg viewBox="0 0 60 90" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="flapper-body" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#A8A8A8" />
                <stop offset="100%" stopColor="#3A3A3A" />
              </linearGradient>
            </defs>
            {/* Placa metálica de montaje superior */}
            <circle cx="30" cy="15" r="14" fill="url(#dark-metallic)" stroke="url(#gold-metallic)" strokeWidth="2.5" />
            {/* Perno del pivote del flapper */}
            <circle cx="30" cy="15" r="6" fill="url(#chrome-metallic)" stroke="#111" strokeWidth="1" />
            
            {/* Brazo de la aguja metálica */}
            <path
              d="M 26 15 L 28 65 L 30 75 L 32 65 L 34 15 Z"
              fill="url(#flapper-body)"
              stroke="#222222"
              strokeWidth="1"
            />
            
            {/* Punta de colisión dorada del flapper */}
            <path
              d="M 28 65 L 30 84 L 32 65 Z"
              fill="url(#gold-metallic)"
              stroke="#3E2C00"
              strokeWidth="0.8"
            />
            <circle cx="30" cy="65" r="2.5" fill="url(#ruby-glow)" />
          </svg>
        </motion.div>

        {/* Rueda SVG - Máxima Escala */}
        <motion.div
          animate={controls}
          className="w-[92vw] h-[92vw] max-w-[480px] max-h-[480px] drop-shadow-[0_0_60px_rgba(255,184,0,0.25)]"
        >
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
            <defs>
              {/* Oro Pulido Metálico */}
              <linearGradient id="gold-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="30%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#AA7C11" />
                <stop offset="70%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#5A3A00" />
              </linearGradient>

              {/* Acero / Cromo Brillante */}
              <linearGradient id="chrome-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#D2D2D2" />
                <stop offset="50%" stopColor="#787878" />
                <stop offset="75%" stopColor="#222222" />
                <stop offset="100%" stopColor="#A0A0A0" />
              </linearGradient>

              {/* Acero Oscuro */}
              <radialGradient id="dark-metallic" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3A3A3A" />
                <stop offset="70%" stopColor="#1C1C1C" />
                <stop offset="100%" stopColor="#0B0B0B" />
              </radialGradient>

              {/* Brillo Rubí Central */}
              <radialGradient id="ruby-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF4D4D" />
                <stop offset="70%" stopColor="#D21F2D" />
                <stop offset="100%" stopColor="#4A0005" />
              </radialGradient>

              {/* Filtro de Cristal 3D Convexo */}
              <radialGradient id="wheel-3d-overlay" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0)" />
                <stop offset="80%" stopColor="rgba(0,0,0,0.15)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
              </radialGradient>
            </defs>

            {/* Estilos CSS Locales para Efectos de Iluminación Acelerados por GPU */}
            <style>{`
              @keyframes ledChase {
                0%, 100% {
                  fill: #FFB800;
                  filter: drop-shadow(0 0 3px #FFB800) drop-shadow(0 0 8px #FF8C00);
                }
                50% {
                  fill: #4A3500;
                  filter: none;
                }
              }
              @keyframes ledAmbient {
                0%, 100% {
                  fill: #FFB800;
                  filter: drop-shadow(0 0 2px #FFB800);
                }
                50% {
                  fill: #FF8C00;
                  filter: drop-shadow(0 0 6px #FF8C00) drop-shadow(0 0 12px #FFB800);
                }
              }
              @keyframes rubyPulse {
                0%, 100% {
                  filter: drop-shadow(0 0 2px #FF4D4D);
                }
                50% {
                  filter: drop-shadow(0 0 12px #FF4D4D) drop-shadow(0 0 20px #D21F2D);
                }
              }
              .led-bulb-chasing {
                animation: ledChase 0.6s infinite linear;
              }
              .led-bulb-ambient {
                animation: ledAmbient 2.5s infinite ease-in-out;
              }
              .ruby-pulse-effect {
                animation: rubyPulse 2s infinite ease-in-out;
              }
            `}</style>

            {/* FONDOS Y SEGMENTOS */}
            <g>
              {renderSegments()}
            </g>

            {/* BISEL PERIMETRAL DE CROMO Y ORO (Sobre los sectores para enmarcarlos circularmente) */}
            {/* Anillo de cromo cepillado de base (Grosor 18px cubriendo del radio 182 al 200) */}
            <circle cx="200" cy="200" r="191" fill="none" stroke="url(#chrome-metallic)" strokeWidth="18" />
            
            {/* Canaleta oscura para dar profundidad */}
            <circle cx="200" cy="200" r="191" fill="none" stroke="#0F0F0F" strokeWidth="12" opacity="0.45" />

            {/* Filetes de oro perimetrales */}
            <circle cx="200" cy="200" r="198" fill="none" stroke="url(#gold-metallic)" strokeWidth="3" />
            <circle cx="200" cy="200" r="182" fill="none" stroke="url(#gold-metallic)" strokeWidth="2.5" />

            {/* ANILLO DE 24 BOMBILLAS LED INTELIGENTES (Montadas en la canaleta) */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = i * (360 / 24);
              const rad = (Math.PI * (angle - 90)) / 180;
              const lx = 200 + 191 * Math.cos(rad);
              const ly = 200 + 191 * Math.sin(rad);
              const delay = (i * 0.045).toFixed(3);
              return (
                <circle
                  key={i}
                  cx={lx}
                  cy={ly}
                  r="4.5"
                  className={isSpinning ? 'led-bulb-chasing' : 'led-bulb-ambient'}
                  style={{
                    animationDelay: isSpinning ? `${delay}s` : '0s'
                  }}
                />
              );
            })}

            {/* PERNOS DIVISORIOS FÍSICOS (En los bordes de unión a radio 174) */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = i * 45;
              const rad = (Math.PI * (angle - 90)) / 180;
              const px = 200 + 174 * Math.cos(rad);
              const py = 200 + 174 * Math.sin(rad);
              return (
                <g key={i}>
                  {/* Sombra de perno */}
                  <circle cx={px} cy={py + 1.5} r="5.5" fill="rgba(0,0,0,0.6)" />
                  {/* Borde dorado del perno */}
                  <circle cx={px} cy={py} r="5" fill="url(#gold-metallic)" stroke="#3E2C00" strokeWidth="0.5" />
                  {/* Centro brillante plateado */}
                  <circle cx={px} cy={py} r="2.5" fill="url(#chrome-metallic)" />
                  {/* Brillo solar */}
                  <circle cx={px - 1.2} cy={py - 1.2} r="0.8" fill="#FFFFFF" opacity="0.9" />
                </g>
              );
            })}

            {/* CENTRO MECÁNICO PREMIUM */}
            {/* Anillo de oro exterior */}
            <circle cx="200" cy="200" r="38" fill="url(#gold-metallic)" stroke="#3E2C00" strokeWidth="1" />
            {/* Bisel intermedio de cromo */}
            <circle cx="200" cy="200" r="33" fill="url(#chrome-metallic)" stroke="#1A1A1A" strokeWidth="0.5" />
            {/* Núcleo central de metal oscuro */}
            <circle cx="200" cy="200" r="27" fill="url(#dark-metallic)" />
            {/* Mini-pernos industriales decorativos en el hub */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = i * 60;
              const rad = (Math.PI * (angle - 90)) / 180;
              const hx = 200 + 20 * Math.cos(rad);
              const hy = 200 + 20 * Math.sin(rad);
              return (
                <circle key={i} cx={hx} cy={hy} r="2" fill="url(#gold-metallic)" stroke="#1A1A1A" strokeWidth="0.3" />
              );
            })}
            {/* Gema rubí central pulsante */}
            <circle cx="200" cy="200" r="12" fill="url(#ruby-glow)" className="ruby-pulse-effect" />
            <circle cx="197" cy="197" r="3" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

            {/* EFECTO DE CRISTAL CONVEXO 3D (Sobre toda la rueda para integrar brillos y sombras) */}
            <circle cx="200" cy="200" r="199" fill="url(#wheel-3d-overlay)" pointerEvents="none" />
          </svg>
        </motion.div>
      </div>

      <button
        onPointerDown={handleSpin}
        disabled={isSpinning}
        className={`px-16 py-8 rounded-3xl font-black text-3xl uppercase tracking-[0.3em] transition-all select-none touch-none
          ${isSpinning ? 'opacity-50 scale-95 bg-r9-charcoal text-white/20' : 'bg-r9-red text-white shadow-[0_12px_0_0_#9B141E] hover:bg-[#F52538] active:translate-y-2 active:shadow-none'}
        `}
      >
        {isSpinning ? 'GIRANDO...' : '¡GIRAR!'}
      </button>
    </div>
  );
}

