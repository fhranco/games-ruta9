export function calculateMemoryMatchResult(matchedPairsCount) {
  if (matchedPairsCount >= 8) {
    return {
      score: 100,
      message: "¡Victoria Perfecta!",
      prize: "Participas por Promo Burger + Bebida para 2 personas",
      condition: "Válido hoy en caja con este código",
      level: "perfect",
      couponPrefix: "R9-PERF"
    };
  }

  if (matchedPairsCount >= 6) {
    return {
      score: 80,
      message: "¡Gran Memoria!",
      prize: "2 Cupones para sorteo",
      condition: "Solo en caja con tu compra",
      level: "excellent",
      couponPrefix: "R9-PAP"
    };
  }

  if (matchedPairsCount >= 4) {
    return {
      score: 50,
      message: "¡Buen Intento!",
      prize: "1 Cupón para sorteo",
      condition: "Acompañando tu menú",
      level: "good",
      couponPrefix: "R9-SALS"
    };
  }

  return {
    score: 0,
    message: "¡Se te acabó el tiempo!",
    prize: "Vuelve mañana por otro intento",
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
