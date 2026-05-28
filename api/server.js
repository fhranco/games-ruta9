/**
 * RUTA 9 — Servidor Centralizado de Stock (Versión Vercel Serverless)
 * ==================================================================
 * Este archivo corre en Vercel como una función servidor unificada.
 * Resuelve y rutea todas las peticiones a /api/... y /admin/logs.
 * 
 * Incorpora soporte completo para huso horario de Chile (America/Santiago)
 * y evalúa la hora peak oficial de 16:30 a 20:00 hrs.
 */

const fs = require('fs');
const path = require('path');
const url = require('url');

const DB_FILE = path.join(process.cwd(), 'stock_db.json');

// Mapeo de nombres descriptivos de premios para los vouchers
const PRIZE_LABELS = {
  "DESCUENTO_30": "30% DE DESCUENTO",
  "DESCUENTO_20": "20% DE DESCUENTO",
  "DESCUENTO_10": "10% DE DESCUENTO",
  "HELADO_SOFT": "HELADO SOFT GRATIS",
  "PAPAS_FRITAS": "PAPAS FRITAS GRATIS",
  "SCHOP_BEBIDA": "BEBIDA O SCHOP GRATIS",
  "REGALO_SORPRESA": "REGALO SORPRESA R9",
  "SIGUE_PARTICIPANDO": "SIGUE PARTICIPANDO"
};

// Configuración inicial de límites horarios (Chile Local Time)
const TIME_BLOCKS = [
  { id: 1, startHour: 12, endHour: 14 },
  { id: 2, startHour: 14, endHour: 16 },
  { id: 3, startHour: 16, endHour: 18 },
  { id: 4, startHour: 18, endHour: 20 },
  { id: 5, startHour: 20, endHour: 22 }
];

let db = null;
let consecutiveLosses = 0; // Almacenamiento en memoria para anti-sequía (vida del contenedor)

function loadDb() {
  if (db) return db;
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
    } else {
      throw new Error("Base de datos de stock stock_db.json no encontrada.");
    }
  } catch (err) {
    console.warn("⚠️ Advertencia: Usando fallback inicial de stock en memoria.", err.message);
    db = {
      lastUpdated: new Date().toISOString(),
      deliveredCount: 0,
      gameStock: {
        ruleta: { DESCUENTO_30: 1, DESCUENTO_20: 5, DESCUENTO_10: 20, HELADO_SOFT: 50, PAPAS_FRITAS: 8, SCHOP_BEBIDA: 6, REGALO_SORPRESA: 6 },
        "deten-el-9": { DESCUENTO_30: 1, DESCUENTO_20: 0, DESCUENTO_10: 0, HELADO_SOFT: 0, PAPAS_FRITAS: 0, SCHOP_BEBIDA: 0, REGALO_SORPRESA: 0 },
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
      },
      deliveredList: []
    };
  }
  return db;
}

function saveDb() {
  try {
    if (db) {
      db.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    }
  } catch (err) {
    // Es común que falle en Vercel (sistema de archivos de solo lectura). No interrumpe la ejecución del giro.
    console.warn("⚠️ Advertencia: No se pudo escribir stock_db.json físicamente (comportamiento esperado en Vercel Serverless).", err.message);
  }
}

function getActiveBlock(testBlockOverride = null) {
  if (testBlockOverride) {
    const overrideVal = parseInt(testBlockOverride, 10);
    if (overrideVal >= 1 && overrideVal <= 5) return overrideVal;
  }

  const ahora = new Date();
  const chileTime = new Date(ahora.toLocaleString("en-US", {timeZone: "America/Santiago"}));
  const currentHour = chileTime.getHours();

  if (currentHour < 12) return 1;
  if (currentHour >= 22) return 5;

  const block = TIME_BLOCKS.find(b => currentHour >= b.startHour && currentHour < b.endHour);
  return block ? block.id : 5;
}

function getAvailableStockForBlock(blockNum) {
  const available = {
    "DESCUENTO_30": 0,
    "DESCUENTO_20": 0,
    "DESCUENTO_10": 0,
    "HELADO_SOFT": 0,
    "PAPAS_FRITAS": 0,
    "SCHOP_BEBIDA": 0,
    "REGALO_SORPRESA": 0
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
}

function generateCouponCode(prefix, prizeId = "") {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  let prizeLabel = prefix;
  if (prizeId) {
    if (prizeId.includes("DESCUENTO_30")) prizeLabel = "30DESCUENTO";
    else if (prizeId.includes("DESCUENTO_20")) prizeLabel = "20DESCUENTO";
    else if (prizeId.includes("DESCUENTO_10")) prizeLabel = "10DESCUENTO";
    else if (prizeId.includes("HELADO_SOFT")) prizeLabel = "HELADO";
    else if (prizeId.includes("PAPAS_FRITAS")) prizeLabel = "PAPAS";
    else if (prizeId.includes("SCHOP_BEBIDA")) prizeLabel = "BEBIDA";
    else if (prizeId.includes("REGALO_SORPRESA")) prizeLabel = "SORPRESA";
  }
  
  return `R9-GANASTE-${prizeLabel}-${day}${month}-${random}`;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Vercel Serverless Function entrypoint
module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // Cargar base de datos (con persistencia en la memoria del contenedor activo)
  loadDb();

  const parsedUrl = url.parse(req.url, true);
  const pathName = parsedUrl.pathname.replace(/^\/api/, ''); // Normalizar paths remotos
  const testBlock = parsedUrl.query.testBlock;

  // ====================================================
  // API ENDPOINT: GET /stock
  // ====================================================
  if (req.method === 'GET' && (pathName === '/stock' || pathName === '/stock/')) {
    const activeBlock = getActiveBlock(testBlock);
    const blockAvailable = getAvailableStockForBlock(activeBlock);

    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      activeBlock,
      blockAvailable,
      gameStock: db.gameStock,
      deliveredCount: db.deliveredCount
    }));
    return;
  }

  // ====================================================
  // API ENDPOINT: GET /can-win
  // ====================================================
  if (req.method === 'GET' && (pathName === '/can-win' || pathName === '/can-win/')) {
    const gameId = parsedUrl.query.gameId;
    if (!gameId || !db.gameStock[gameId]) {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'gameId inválido o faltante' }));
      return;
    }

    const activeBlock = getActiveBlock(testBlock);
    const blockAvailable = getAvailableStockForBlock(activeBlock);
    const gameLimits = db.gameStock[gameId];

    let canWin = false;
    for (const prizeCategory in gameLimits) {
      if (gameLimits[prizeCategory] > 0 && blockAvailable[prizeCategory] > 0) {
        canWin = true;
        break;
      }
    }

    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      gameId,
      canWin,
      activeBlock
    }));
    return;
  }

  // Helper para leer body en stream (si Vercel no lo pre-parseó)
  const getRequestBody = () => {
    return new Promise((resolve) => {
      if (req.body && typeof req.body === 'object') {
        resolve(req.body);
        return;
      }
      if (req.body && typeof req.body === 'string') {
        try { resolve(JSON.parse(req.body)); } catch(e) { resolve({}); }
        return;
      }
      let bodyData = '';
      req.on('data', chunk => { bodyData += chunk; });
      req.on('end', () => {
        try {
          resolve(bodyData ? JSON.parse(bodyData) : {});
        } catch (err) {
          resolve({});
        }
      });
    });
  };

  // ====================================================
  // API ENDPOINT: POST /spin (RULETA RUTA 9)
  // ====================================================
  if (req.method === 'POST' && (pathName === '/spin' || pathName === '/spin/')) {
    const data = await getRequestBody();
    const playerName = data.playerName || 'Invitado';
    const receipt = data.receipt || '0000';
    const activeBlock = getActiveBlock(testBlock);
    const blockAvailable = getAvailableStockForBlock(activeBlock);
    const ruletaStock = db.gameStock.ruleta;

    // 1. Decidir si es un giro ganador (hora local de Chile)
    const ahora = new Date();
    const chileTime = new Date(ahora.toLocaleString("en-US", {timeZone: "America/Santiago"}));
    const hora = chileTime.getHours();
    const minutos = chileTime.getMinutes();
    
    // Ventana Peak en Chile: 16:30 - 20:00 (en minutos: 990 a 1200)
    const minutosTotales = hora * 60 + minutos;
    const esPeak = (minutosTotales >= 990 && minutosTotales < 1200);
    const winRate = esPeak ? 0.35 : 0.25; 
    const maxConsecutiveLossesAllowed = esPeak ? 3 : 5;

    let isWinner = Math.random() < winRate;

    // Regla Anti-Sequía
    if (consecutiveLosses >= maxConsecutiveLossesAllowed) {
      isWinner = true;
      console.log(`🛡️ [RULETA SERVERLESS] Forzando ganador por regla Anti-Sequía (Tiros perdidos seguidos: ${consecutiveLosses})`);
    }

    const possiblePrizes = [];
    const prizeWeights = {
      "HELADO_SOFT": 50,
      "DESCUENTO_10": 25,
      "PAPAS_FRITAS": 16,
      "SCHOP_BEBIDA": 12,
      "REGALO_SORPRESA": 12,
      "DESCUENTO_20": 10,
      "DESCUENTO_30": 2
    };

    for (const prize in ruletaStock) {
      if (ruletaStock[prize] > 0 && blockAvailable[prize] > 0) {
        possiblePrizes.push({
          id: prize,
          weight: prizeWeights[prize] || 10
        });
      }
    }

    // Pérdida forzada si no queda stock o azar fallido
    if (!isWinner || possiblePrizes.length === 0) {
      if (possiblePrizes.length > 0) {
        consecutiveLosses++;
      }
      
      const losingIndices = [1, 3, 5];
      const selectedIndex = losingIndices[Math.floor(Math.random() * losingIndices.length)];

      res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: "PERDEDOR",
        premio: "SIGUE_PARTICIPANDO",
        label: PRIZE_LABELS["SIGUE_PARTICIPANDO"],
        index: selectedIndex,
        couponCode: ""
      }));
      return;
    }

    // Sorteo ponderado
    const totalWeight = possiblePrizes.reduce((sum, p) => sum + p.weight, 0);
    let randomVal = Math.random() * totalWeight;
    let selectedPrize = possiblePrizes[0].id;

    for (const p of possiblePrizes) {
      randomVal -= p.weight;
      if (randomVal <= 0) {
        selectedPrize = p.id;
        break;
      }
    }

    // Mapeo a segmento frontend
    let targetIndex = 1;
    if (selectedPrize.startsWith("DESCUENTO")) {
      targetIndex = 0;
    } else if (selectedPrize === "HELADO_SOFT") {
      targetIndex = 2;
    } else if (selectedPrize === "PAPAS_FRITAS") {
      targetIndex = 4;
    } else if (selectedPrize === "SCHOP_BEBIDA") {
      targetIndex = 6;
    } else if (selectedPrize === "REGALO_SORPRESA") {
      targetIndex = 7;
    }

    consecutiveLosses = 0;

    // Descontar stock
    db.gameStock.ruleta[selectedPrize]--;
    db.blockDelivered[activeBlock.toString()][selectedPrize]++;
    db.deliveredCount++;

    const coupon = generateCouponCode("RULETA", selectedPrize);
    const playRecord = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      game: "ruleta",
      playerName,
      receipt,
      prize: selectedPrize,
      couponCode: coupon,
      block: activeBlock
    };
    db.deliveredList.push(playRecord);

    saveDb();

    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: "GANADOR",
      premio: selectedPrize,
      label: PRIZE_LABELS[selectedPrize],
      index: targetIndex,
      couponCode: coupon
    }));
    return;
  }

  // ====================================================
  // API ENDPOINT: POST /claim-skill-prize (JUEGOS DE HABILIDAD)
  // ====================================================
  if (req.method === 'POST' && (pathName === '/claim-skill-prize' || pathName === '/claim-skill-prize/')) {
    const data = await getRequestBody();
    const gameId = data.gameId;
    const playerName = data.playerName || 'Invitado';
    const receipt = data.receipt || '0000';
    const skillSuccessful = !!data.skillSuccessful;

    if (!gameId || !db.gameStock[gameId]) {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'gameId inválido' }));
      return;
    }

    const activeBlock = getActiveBlock(testBlock);
    const blockAvailable = getAvailableStockForBlock(activeBlock);
    const gameStock = db.gameStock[gameId];

    if (!skillSuccessful) {
      res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: "PERDEDOR",
        premio: "SIGUE_PARTICIPANDO",
        label: PRIZE_LABELS["SIGUE_PARTICIPANDO"],
        couponCode: ""
      }));
      return;
    }

    const availablePrizes = [];
    for (const prize in gameStock) {
      if (gameStock[prize] > 0 && blockAvailable[prize] > 0) {
        availablePrizes.push(prize);
      }
    }

    if (availablePrizes.length === 0) {
      res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: "PERDEDOR",
        premio: "SIGUE_PARTICIPANDO",
        label: PRIZE_LABELS["SIGUE_PARTICIPANDO"],
        couponCode: ""
      }));
      return;
    }

    const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];

    // Descontar stock
    db.gameStock[gameId][selectedPrize]--;
    db.blockDelivered[activeBlock.toString()][selectedPrize]++;
    db.deliveredCount++;

    const coupon = generateCouponCode(gameId.toUpperCase().replace('-', ''), selectedPrize);
    const playRecord = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      game: gameId,
      playerName,
      receipt,
      prize: selectedPrize,
      couponCode: coupon,
      block: activeBlock
    };
    db.deliveredList.push(playRecord);

    saveDb();

    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: "GANADOR",
      premio: selectedPrize,
      label: PRIZE_LABELS[selectedPrize],
      couponCode: coupon
    }));
    return;
  }

  // ====================================================
  // API ENDPOINT: GET /admin/logs (PANEL DE AUDITORÍA)
  // ====================================================
  // Soporta tanto llamadas directas como reescritas desde /admin/logs
  if (req.method === 'GET' && (parsedUrl.pathname === '/admin/logs' || parsedUrl.pathname === '/admin/logs/')) {
    let tableRows = '';
    const reversedList = [...db.deliveredList].reverse();
    reversedList.forEach(log => {
      const date = new Date(log.timestamp).toLocaleString('es-CL', { timeZone: 'America/Santiago' });
      tableRows += `
        <tr class="border-b border-slate-800 hover:bg-slate-900/40 transition-colors">
          <td class="px-6 py-4 font-mono text-xs text-slate-500">${log.id}</td>
          <td class="px-6 py-4 font-semibold text-slate-300">${date}</td>
          <td class="px-6 py-4">
            <span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950 border border-slate-800 text-[#FFB800]">${log.game.toUpperCase()}</span>
          </td>
          <td class="px-6 py-4 font-medium text-white">${log.playerName}</td>
          <td class="px-6 py-4 font-mono text-xs text-slate-400">${log.receipt}</td>
          <td class="px-6 py-4">
            <span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950 border border-slate-800 text-white">${PRIZE_LABELS[log.prize] || log.prize}</span>
          </td>
          <td class="px-6 py-4 font-mono text-sm font-black text-[#FFB800] select-all">${log.couponCode}</td>
          <td class="px-6 py-4 font-black text-xs text-slate-500 text-center">B${log.block}</td>
        </tr>
      `;
    });

    const summaryCounts = {};
    db.deliveredList.forEach(log => {
      summaryCounts[log.game] = (summaryCounts[log.game] || 0) + 1;
    });

    const totalDelivered = db.deliveredCount || db.deliveredList.length;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ruta 9 — Panel de Auditoría de Premios</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Outfit', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-white min-h-screen p-6 md:p-12 relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
  <div class="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#C52026]/5 blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#FFB800]/5 blur-[120px] pointer-events-none"></div>

  <div class="max-w-7xl mx-auto space-y-12">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-8">
      <div>
        <h1 class="text-4xl font-black italic tracking-tighter flex items-center gap-2">
          <span>RUTA</span><span class="text-[#C52026]">9</span>
          <span class="font-light opacity-50 uppercase tracking-widest text-xs border-l border-white/20 pl-4 ml-2">VERCEL SERVERLESS AUDIT</span>
        </h1>
        <p class="text-slate-500 text-sm mt-1.5 font-medium">Registro de auditoría transaccional de tótems en tiempo real en la nube.</p>
      </div>
      <div class="flex items-center gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl px-6 py-3.5 shadow-xl backdrop-blur-md">
        <div class="text-right">
          <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">TOTAL ENTREGADOS</p>
          <p class="text-3xl font-black text-[#FFB800] mt-1 leading-none">${totalDelivered}</p>
        </div>
      </div>
    </header>

    <section class="grid grid-cols-2 md:grid-cols-5 gap-4">
      ${["ruleta", "deten-el-9", "punto-perfecto", "calza-burger", "memoria-burger"].map(game => `
        <div class="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">${game.toUpperCase()}</span>
          <span class="text-3xl font-black text-white mt-3 leading-none">${summaryCounts[game] || 0}</span>
        </div>
      `).join('')}
    </section>

    <section class="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div class="px-6 py-5 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center">
        <h2 class="text-lg font-black tracking-tight flex items-center gap-2">
          <span>🧾</span> HISTORIAL DE GIROS Y GANADORES (CHILE)
        </h2>
        <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider bg-slate-950 border border-slate-800 px-3 py-1 rounded-full">Últimos primeros</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950/20 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <th class="px-6 py-4">ID Transacción</th>
              <th class="px-6 py-4">Fecha / Hora (CL)</th>
              <th class="px-6 py-4">Juego</th>
              <th class="px-6 py-4">Jugador</th>
              <th class="px-6 py-4">Boleta</th>
              <th class="px-6 py-4">Premio Otorgado</th>
              <th class="px-6 py-4">Código de Voucher</th>
              <th class="px-6 py-4 text-center">Bloque</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || `
              <tr>
                <td colspan="8" class="text-center py-16 text-slate-600 font-semibold uppercase tracking-widest text-sm">
                  📭 Sin giros registrados aún.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</body>
</html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // 404
  res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Endpoint no encontrado' }));
};
