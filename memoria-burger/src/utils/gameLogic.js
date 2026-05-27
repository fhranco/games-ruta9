export function calculateMemoryMatchResult(matchedPairsCount) {
  if (matchedPairsCount >= 8) {
    return {
      score: 100,
      message: "¡Victoria Perfecta!",
      prize: "Hamburguesa Promo R9 Gratis",
      condition: "Válido hoy en caja con este código",
      level: "perfect",
      couponPrefix: "R9-PERF"
    };
  }

  if (matchedPairsCount >= 6) {
    return {
      score: 80,
      message: "¡Gran Memoria!",
      prize: "Papas Fritas Gratis",
      condition: "Solo en caja con tu compra",
      level: "excellent",
      couponPrefix: "R9-PAP"
    };
  }

  if (matchedPairsCount >= 4) {
    return {
      score: 50,
      message: "¡Buen Intento!",
      prize: "Salsa Premium Gratis",
      condition: "Acompañando tu menú",
      level: "good",
      couponPrefix: "R9-SALS"
    };
  }

  return {
    score: 0,
    message: "¡Se te acabó el tiempo!",
    prize: "Sigue participando",
    condition: "¡Prueba de nuevo y sé más veloz!",
    level: "try-again",
    couponPrefix: "NONE"
  };
}

export function generateCouponCode(prefix) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${day}${month}-${random}`;
}
