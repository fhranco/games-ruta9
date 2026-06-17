/**
 * RUTA 9 — Servidor Centralizado de Stock (Versión Vercel Serverless)
 * ==================================================================
 * Este archivo corre en Vercel como una función servidor unificada.
 * Resuelve y rutea todas las peticiones a /api/... y /admin/logs.
 * 
 * Incorpora soporte completo para huso horario de Chile (America/Santiago)
 * y evalúa la hora peak oficial de 16:30 a 20:00 hrs.
 */

import fs from 'fs';
import path from 'path';
import url from 'url';

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

function checkAuth(req) {
  const cookieHeader = req.headers.cookie || '';
  return cookieHeader.includes('r9_admin_session=authenticated');
}

function serveLogin(req, res, errorMsg = '') {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ruta 9 — Acceso Administrativo (Vercel)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Outfit', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
  <div class="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#C52026]/5 blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#FFB800]/5 blur-[120px] pointer-events-none"></div>

  <div class="w-full max-w-md bg-slate-900/30 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-black italic tracking-tighter">
        <span>RUTA</span><span class="text-[#C52026]">9</span>
        <span class="font-light opacity-50 uppercase tracking-widest text-xs border-l border-white/20 pl-4 ml-2">ADMIN</span>
      </h1>
      <p class="text-slate-500 text-xs mt-2 uppercase tracking-widest font-black">Acceso Protegido (Vercel)</p>
    </div>

    <form action="/admin/login" method="POST" class="space-y-6">
      <div class="space-y-2">
        <label class="text-xs font-black uppercase tracking-wider text-slate-400">Contraseña Administrativa</label>
        <input type="password" name="password" placeholder="••••••••" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-[#FFB800] outline-none transition-colors text-center font-mono tracking-widest">
        ${errorMsg ? `<p class="text-xs text-red-500 font-bold mt-1 text-center">⚠️ ${errorMsg}</p>` : ''}
      </div>

      <button type="submit" class="w-full py-4 bg-[#FFB800] text-black font-black uppercase tracking-wider text-sm rounded-xl shadow-xl hover:bg-[#FFB800]/90 transition-all cursor-pointer">
        🔑 Ingresar
      </button>
    </form>
  </div>
</body>
</html>
  `;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// Vercel Serverless Function entrypoint
export default async (req, res) => {
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

  // Rutas públicas de Login
  if (req.method === 'GET' && (pathName === '/admin/login' || pathName === '/admin/login/')) {
    serveLogin(req, res);
    return;
  }

  if (req.method === 'POST' && (pathName === '/admin/login' || pathName === '/admin/login/')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const password = params.get('password');
      const settings = db.settings || {};
      const actualPin = settings.adminPin || "R9Admin2026";

      if (password === actualPin) {
        res.writeHead(302, {
          'Set-Cookie': 'r9_admin_session=authenticated; Path=/; HttpOnly; Max-Age=86400',
          'Location': '/admin/config'
        });
        res.end();
      } else {
        serveLogin(req, res, 'Contraseña incorrecta');
      }
    });
    return;
  }

  // Protección de rutas administrativas
  if (pathName === '/admin/config' || pathName === '/admin/config/' || pathName === '/admin/logs' || pathName === '/admin/logs/') {
    if (!checkAuth(req)) {
      res.writeHead(302, { 'Location': '/admin/login' });
      res.end();
      return;
    }
  }

  // Protección de API de configuración (POST)
  if (req.method === 'POST' && (pathName === '/config' || pathName === '/config/')) {
    if (!checkAuth(req)) {
      res.writeHead(401, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'No autorizado' }));
      return;
    }
  }
  const testBlock = parsedUrl  // ====================================================
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
      deliveredCount: db.deliveredCount,
      settings: db.settings
    }));
    return;
  }

  // ====================================================
  // API ENDPOINT: GET /config
  // ====================================================
  if (req.method === 'GET' && (pathName === '/config' || pathName === '/config/')) {
    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, settings: db.settings }));
    return;
  }

  // ====================================================
  // API ENDPOINT: POST /config
  // ====================================================
  if (req.method === 'POST' && (pathName === '/config' || pathName === '/config/')) {
    const data = await getRequestBody();
    try {
      db.settings = {
        winRateStandard: !isNaN(parseFloat(data.winRateStandard)) ? parseFloat(data.winRateStandard) : 0.25,
        winRatePeak: !isNaN(parseFloat(data.winRatePeak)) ? parseFloat(data.winRatePeak) : 0.35,
        peakHourStart: data.peakHourStart || "16:30",
        peakHourEnd: data.peakHourEnd || "20:30",
        maxConsecutiveLossesStandard: parseInt(data.maxConsecutiveLossesStandard, 10) || 5,
        maxConsecutiveLossesPeak: parseInt(data.maxConsecutiveLossesPeak, 10) || 3,
        roulettePrizeWeights: data.roulettePrizeWeights || {},
        detenEl9Tolerance: !isNaN(parseFloat(data.detenEl9Tolerance)) ? parseFloat(data.detenEl9Tolerance) : 0.05,
        calzaBurgerTimeLimit: !isNaN(parseInt(data.calzaBurgerTimeLimit, 10)) ? parseInt(data.calzaBurgerTimeLimit, 10) : 30,
        memoriaBurgerTimeLimit: !isNaN(parseInt(data.memoriaBurgerTimeLimit, 10)) ? parseInt(data.memoriaBurgerTimeLimit, 10) : 30,
        adminPin: db.settings.adminPin || "R9Admin2026"
      };

      saveDb();
      res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, settings: db.settings }));
    } catch (err) {
      console.error('❌ Error guardando configuración (Vercel):', err.message);
      res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Error interno guardando configuración' }));
    }
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

    const settings = db.settings || {};

    // Decidir si es un giro ganador (hora local de Chile)
    const ahora = new Date();
    const chileTime = new Date(ahora.toLocaleString("en-US", {timeZone: "America/Santiago"}));
    const hora = chileTime.getHours();
    const minutos = chileTime.getMinutes();
    const minutosTotales = hora * 60 + minutos;
    
    const peakHourStart = settings.peakHourStart || "16:30";
    const peakHourEnd = settings.peakHourEnd || "20:30";
    const parseTimeToMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const peakStart = parseTimeToMinutes(peakHourStart);
    const peakEnd = parseTimeToMinutes(peakHourEnd);

    const esPeak = (minutosTotales >= peakStart && minutosTotales < peakEnd);
    const winRate = esPeak 
      ? (settings.winRatePeak !== undefined ? settings.winRatePeak : 0.35) 
      : (settings.winRateStandard !== undefined ? settings.winRateStandard : 0.25);
    const maxConsecutiveLossesAllowed = esPeak 
      ? (settings.maxConsecutiveLossesPeak !== undefined ? settings.maxConsecutiveLossesPeak : 3) 
      : (settings.maxConsecutiveLossesStandard !== undefined ? settings.maxConsecutiveLossesStandard : 5);

    let isWinner = Math.random() < winRate;

    // Regla Anti-Sequía
    if (consecutiveLosses >= maxConsecutiveLossesAllowed) {
      isWinner = true;
      console.log(`🛡️ [RULETA SERVERLESS] Forzando ganador por regla Anti-Sequía (Tiros perdidos seguidos: ${consecutiveLosses})`);
    }

    const possiblePrizes = [];
    const prizeWeights = settings.roulettePrizeWeights || {
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

      console.log(`❌ [RULETA - PERDEDOR] Jugador: ${playerName} | Boleta: ${receipt} | Resultado: SIGUE PARTICIPANDO`);

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

    console.log(`🎉 [RULETA - GANADOR] Jugador: ${playerName} | Boleta: ${receipt} | Premio: ${selectedPrize} (${PRIZE_LABELS[selectedPrize]}) | Cupón: ${coupon} | Bloque: ${activeBlock}`);

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

    const settings = db.settings || {};

    const activeBlock = getActiveBlock(testBlock);
    const blockAvailable = getAvailableStockForBlock(activeBlock);
    const gameStock = db.gameStock[gameId];

    if (!skillSuccessful) {
      console.log(`❌ [HABILIDAD - FALLIDO] Juego: ${gameId} | Jugador: ${playerName} | Boleta: ${receipt} | Resultado: Habilidad no superada`);
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
      console.log(`❌ [HABILIDAD - SIN STOCK] Juego: ${gameId} | Jugador: ${playerName} | Boleta: ${receipt} | Resultado: Sin stock disponible`);
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

    console.log(`🎉 [HABILIDAD - GANADOR] Juego: ${gameId} | Jugador: ${playerName} | Boleta: ${receipt} | Premio: ${selectedPrize} (${PRIZE_LABELS[selectedPrize]}) | Cupón: ${coupon} | Bloque: ${activeBlock}`);

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
            <span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950 border border-slate-800 text-white">${PRIZE_LABELS[log.prize] || log.prize}</span>
          </td>
          <td class="px-6 py-4 font-medium text-white">${log.playerName}</td>
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
      
      <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div class="flex items-center gap-3">
          <a href="/admin/logs" class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#FFB800] border border-[#FFB800] text-black shadow-lg shadow-amber-500/10">📋 HISTORIAL LOGS</a>
          <a href="/admin/config" class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all">⚙️ CONFIGURACIÓN</a>
        </div>
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl px-6 py-3.5 shadow-xl backdrop-blur-md text-right">
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
              <th class="px-6 py-4">Premio Otorgado</th>
              <th class="px-6 py-4">Código de Voucher</th>
              <th class="px-6 py-4 text-center">Bloque</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || `
              <tr>
                <td colspan="7" class="text-center py-16 text-slate-600 font-semibold uppercase tracking-widest text-sm">
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

  // ====================================================
  // API ENDPOINT: GET /admin/config (PANEL DE CONFIGURACIÓN VERCEL)
  // ====================================================
  if (req.method === 'GET' && (parsedUrl.pathname === '/admin/config' || parsedUrl.pathname === '/admin/config/')) {
    const settings = db.settings || {};
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ruta 9 — Configuración de Parámetros</title>
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

  <!-- Toast Notification -->
  <div id="toast" class="fixed top-6 right-6 z-50 transform translate-x-80 opacity-0 transition-all duration-300 bg-slate-900 border-2 border-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
    <span class="text-emerald-500 text-xl font-bold">✓</span>
    <span class="text-sm font-semibold uppercase tracking-wider">¡Configuración guardada!</span>
  </div>

  <div class="max-w-4xl mx-auto space-y-12">
    <!-- Header -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-8">
      <div>
        <h1 class="text-4xl font-black italic tracking-tighter flex items-center gap-2">
          <span>RUTA</span><span class="text-[#C52026]">9</span>
          <span class="font-light opacity-50 uppercase tracking-widest text-xs border-l border-white/20 pl-4 ml-2">CONFIGURACIÓN</span>
        </h1>
        <p class="text-slate-500 text-sm mt-1.5 font-medium">Panel de administración dinámica del motor de juegos (Vercel).</p>
      </div>
      
      <div class="flex items-center gap-3">
        <a href="/admin/logs" class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all">📋 HISTORIAL LOGS</a>
        <a href="/admin/config" class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#FFB800] border border-[#FFB800] text-black shadow-lg shadow-amber-500/10">⚙️ CONFIGURACIÓN</a>
      </div>
    </header>

    <form id="configForm" class="space-y-8">
      <!-- SECCIÓN 1: JUEGO 1 - RULETA RUTA 9 -->
      <div class="bg-slate-900/20 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md animate-fade-in">
        <h2 class="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
          <span>🎡</span> Juego 1: Ruleta Ruta 9
          <span class="bg-amber-500/20 text-[#FFB800] border border-amber-500/30 text-[9px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest ml-2 align-middle">Juego Ruleta</span>
        </h2>
        <p class="text-slate-500 text-xs">Configura la probabilidad de ganar, los horarios de flujo alto (Peak) y el reparto de los premios físicos para la ruleta.</p>

        <!-- Sub-grilla: Probabilidades y Horario Peak -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          <!-- Probabilidades -->
          <div class="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 space-y-4">
            <h3 class="text-sm font-black text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-2">
              <span>🎯</span> Probabilidad de Premios
            </h3>
            
            <div class="space-y-4">
              <!-- Win Rate Standard -->
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-xs font-black uppercase tracking-wider text-slate-400">En Horario Normal</label>
                  <span id="winRateStandardLabel" class="text-sm font-black text-[#FFB800] font-mono">25%</span>
                </div>
                <input type="range" name="winRateStandard" min="0" max="1" step="0.05" value="${settings.winRateStandard ?? 0.25}" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FFB800]" oninput="document.getElementById('winRateStandardLabel').innerText = Math.round(this.value * 100) + '%'">
                <p class="text-[10px] text-slate-500 leading-snug">Ejemplo: **25%** significa que 1 de cada 4 personas que juegan ganará un premio físico; los otros 3 obtendrán 'Sigue Participando'.</p>
              </div>

              <!-- Win Rate Peak -->
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-xs font-black uppercase tracking-wider text-slate-400">En Hora Peak (Alto Flujo)</label>
                  <span id="winRatePeakLabel" class="text-sm font-black text-[#C52026] font-mono">35%</span>
                </div>
                <input type="range" name="winRatePeak" min="0" max="1" step="0.05" value="${settings.winRatePeak ?? 0.35}" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#C52026]" oninput="document.getElementById('winRatePeakLabel').innerText = Math.round(this.value * 100) + '%'">
                <p class="text-[10px] text-slate-500 leading-snug">Ejemplo: **35%** significa que aproximadamente 1 de cada 3 personas que jueguen en las horas configuradas a la derecha ganará.</p>
              </div>
            </div>
          </div>

          <!-- Horario Peak -->
          <div class="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 space-y-4">
            <h3 class="text-sm font-black text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-2">
              <span>⏰</span> Rango Horario Peak
            </h3>
            <p class="text-[10px] text-slate-500">Establece las horas en las que el local tiene más público para activar automáticamente el porcentaje de premios alto.</p>
            
            <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase tracking-wider text-slate-500">Hora de Inicio</label>
                <input type="text" name="peakHourStart" value="${settings.peakHourStart || '16:30'}" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-center focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] outline-none transition-colors">
                <p class="text-[9px] text-slate-600 mt-1 leading-snug text-center">Formato 24 hrs. Ejemplo: **16:30**</p>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase tracking-wider text-slate-500">Hora de Fin</label>
                <input type="text" name="peakHourEnd" value="${settings.peakHourEnd || '20:30'}" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-center focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] outline-none transition-colors">
                <p class="text-[9px] text-slate-600 mt-1 leading-snug text-center">Formato 24 hrs. Ejemplo: **20:30**</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Reparto de Premios de la Ruleta -->
        <div class="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 space-y-4">
          <h3 class="text-sm font-black text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-2">
            <span>🎡</span> Reparto y Frecuencia de Premios
          </h3>
          <p class="text-[10px] text-slate-500">Determina qué tan seguido sale cada premio una vez que el sistema decide entregar uno. **El premio con el número más alto saldrá con mayor frecuencia; poner 0 bloquea el premio.**</p>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            ${Object.keys(PRIZE_LABELS).filter(p => p !== 'SIGUE_PARTICIPANDO').map(prize => {
              const weights = settings.roulettePrizeWeights || {};
              const val = weights[prize] !== undefined ? weights[prize] : 10;
              return `
                <div class="space-y-2 bg-slate-950 border border-slate-900 rounded-xl p-3 flex flex-col justify-between">
                  <label class="text-[9px] font-black uppercase tracking-wider text-slate-400 block">${PRIZE_LABELS[prize]}</label>
                  <input type="number" name="weight_${prize}" min="0" max="200" value="${val}" class="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs font-mono text-center focus:border-[#FFB800] outline-none">
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- SECCIÓN 2: JUEGOS DE HABILIDAD Y DESTREZA -->
      <div class="bg-slate-900/20 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
        <h2 class="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
          <span>🎮</span> Juegos de Habilidad y Destreza
          <span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest ml-2 align-middle">Habilidad</span>
        </h2>
        <p class="text-slate-500 text-xs">Configura la dificultad, margen de error o tiempo asignado para cada uno de los juegos interactivos.</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <!-- Juego 2: Detén el 9 -->
          <div class="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-3">
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-2">
                <span>🟢</span> Detén el 9
              </h3>
              <p class="text-[10px] text-slate-500 mt-2">Dificultad regulada por margen de error en segundos.</p>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Margen de Error (s)</label>
              <input type="number" name="detenEl9Tolerance" min="0.01" max="0.5" step="0.01" value="${settings.detenEl9Tolerance || 0.05}" class="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs font-mono text-center focus:border-[#FFB800] outline-none">
              <p class="text-[9px] text-slate-600 mt-1 leading-snug">Margen para ganar. Escribir **0.05** significa ganar si frena entre **8.95 y 9.05 segundos** (número más alto = más fácil; número más bajo = más difícil).</p>
            </div>
          </div>

          <!-- Juego 3: Calza Burger -->
          <div class="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-3">
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-2">
                <span>🔴</span> Arma la Burger
              </h3>
              <p class="text-[10px] text-slate-500 mt-2">Dificultad regulada por tiempo límite de cocción.</p>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Tiempo de Cocción (s)</label>
              <input type="number" name="calzaBurgerTimeLimit" min="5" max="120" value="${settings.calzaBurgerTimeLimit || 30}" class="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs font-mono text-center focus:border-[#FFB800] outline-none">
              <p class="text-[9px] text-slate-600 mt-1 leading-snug">Duración total de la partida. Por defecto es **30** segundos. Dar más segundos hace el juego **MÁS FÁCIL**; dar menos lo hace **MÁS DIFÍCIL**.</p>
            </div>
          </div>

          <!-- Juego 4: Memoria Burger -->
          <div class="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-3">
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-2">
                <span>🟣</span> Memoria Burger
              </h3>
              <p class="text-[10px] text-slate-500 mt-2">Dificultad regulada por tiempo límite para resolver.</p>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Tiempo de Memoria (s)</label>
              <input type="number" name="memoriaBurgerTimeLimit" min="5" max="120" value="${settings.memoriaBurgerTimeLimit || 30}" class="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs font-mono text-center focus:border-[#FFB800] outline-none">
              <p class="text-[9px] text-slate-600 mt-1 leading-snug">Duración total de la partida. Por defecto es **30** segundos. Dar más segundos para emparejar hace el juego **MÁS FÁCIL**; dar menos lo hace **MÁS DIFÍCIL**.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de Guardado -->
      <div class="flex justify-end pt-4">
        <button type="submit" class="px-8 py-4 bg-[#FFB800] text-black font-black uppercase tracking-wider text-sm rounded-2xl shadow-xl shadow-amber-500/10 active:scale-95 hover:bg-[#FFB800]/90 transition-all cursor-pointer">
          💾 Guardar Cambios
        </button>
      </div>
    </form>
  </div>

  <script>
    // Inicializar visualización de Win Rates
    document.getElementById('winRateStandardLabel').innerText = Math.round(${settings.winRateStandard ?? 0.25} * 100) + '%';
    document.getElementById('winRatePeakLabel').innerText = Math.round(${settings.winRatePeak ?? 0.35} * 100) + '%';

    document.getElementById('configForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const data = {
        winRateStandard: parseFloat(formData.get('winRateStandard')),
        winRatePeak: parseFloat(formData.get('winRatePeak')),
        peakHourStart: formData.get('peakHourStart'),
        peakHourEnd: formData.get('peakHourEnd'),
        maxConsecutiveLossesStandard: 5,
        maxConsecutiveLossesPeak: 3,
        detenEl9Tolerance: parseFloat(formData.get('detenEl9Tolerance')),
        calzaBurgerTimeLimit: parseInt(formData.get('calzaBurgerTimeLimit'), 10) || 30,
        memoriaBurgerTimeLimit: parseInt(formData.get('memoriaBurgerTimeLimit'), 10) || 30,
        roulettePrizeWeights: {
          "DESCUENTO_30": parseInt(formData.get('weight_DESCUENTO_30'), 10) || 0,
          "DESCUENTO_20": parseInt(formData.get('weight_DESCUENTO_20'), 10) || 0,
          "DESCUENTO_10": parseInt(formData.get('weight_DESCUENTO_10'), 10) || 0,
          "HELADO_SOFT": parseInt(formData.get('weight_HELADO_SOFT'), 10) || 0,
          "PAPAS_FRITAS": parseInt(formData.get('weight_PAPAS_FRITAS'), 10) || 0,
          "SCHOP_BEBIDA": parseInt(formData.get('weight_SCHOP_BEBIDA'), 10) || 0,
          "REGALO_SORPRESA": parseInt(formData.get('weight_REGALO_SORPRESA'), 10) || 0
        }
      };

      try {
        const response = await fetch('/api/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const toast = document.getElementById('toast');
          toast.classList.remove('translate-x-80', 'opacity-0');
          toast.classList.add('translate-x-0', 'opacity-100');
          setTimeout(() => {
            toast.classList.remove('translate-x-0', 'opacity-100');
            toast.classList.add('translate-x-80', 'opacity-0');
          }, 3000);
        } else {
          alert('Hubo un error al guardar la configuración.');
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión.');
      }
    });
  </script>
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
