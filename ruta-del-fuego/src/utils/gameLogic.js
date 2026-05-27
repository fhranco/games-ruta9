export function calculateFireRouteResult(releasedFireLevel) {
  const targetFireLevel = 70;
  const diff = Math.abs(releasedFireLevel - targetFireLevel);

  if (diff <= 2) {
    return {
      score: 100,
      message: "Punto Ruta9 alcanzado",
      prize: "3 cupones de sorteo por promo burger por 2",
      condition: "Sujeto a sorteo semanal",
      level: "perfect",
      couponPrefix: "R9-FUEGO"
    };
  }

  if (diff <= 5) {
    return {
      score: 90,
      message: "Fuego perfecto",
      prize: "Papas gratis",
      condition: "Solo en caja",
      level: "excellent",
      couponPrefix: "R9-FUEGO"
    };
  }

  if (diff <= 10) {
    return {
      score: 75,
      message: "Buen punto de brasa",
      prize: "Salsa gratis",
      condition: "Comprando burger",
      level: "good",
      couponPrefix: "R9-FUEGO"
    };
  }

  return {
    score: 10,
    message: "¡Sigue participando!",
    prize: "Sigue participando",
    condition: "¡Sigue intentando!",
    level: "try-again",
    couponPrefix: "R9-FUEGO"
  };
}

export function generateCouponCode(prefix) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${day}${month}-${random}`;
}
