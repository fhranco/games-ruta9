export function calculatePerfectPointResult(stoppedPosition) {
  const targetPosition = 50;
  const diff = Math.abs(stoppedPosition - targetPosition);

  if (diff <= 1) {
    return {
      score: 100,
      message: "Punto perfecto Ruta9",
      prize: "3 cupones de sorteo por promo burger por 2",
      condition: "Sujeto a sorteo semanal",
      level: "perfect",
      couponPrefix: "R9-PERF"
    };
  }

  if (diff <= 3) {
    return {
      score: 90,
      message: "Tremendo punto",
      prize: "Papas gratis",
      condition: "Solo en caja",
      level: "excellent",
      couponPrefix: "R9-UPG"
    };
  }

  if (diff <= 7) {
    return {
      score: 75,
      message: "Muy buen punto",
      prize: "Salsa gratis",
      condition: "Comprando burger",
      level: "good",
      couponPrefix: "R9-SALS"
    };
  }

  return {
    score: 10,
    message: "Se pasó el fuego",
    prize: "Sigue participando",
    condition: "¡Sigue intentando!",
    level: "try-again",
    couponPrefix: "R9-R9"
  };
}

export function generateCouponCode(prefix) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${day}${month}-${random}`;
}
