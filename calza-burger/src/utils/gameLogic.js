export function calculateBurgerMatchResult(completedCount) {
  if (completedCount >= 3) {
    return {
      score: 100,
      message: "¡Maestro de la Ruleta!",
      prize: "Participas por Promo Burger + Bebida para 2 personas",
      condition: "Sujeto a sorteo semanal",
      level: "perfect",
      couponPrefix: "R9-PERF"
    };
  }

  if (completedCount === 2) {
    return {
      score: 80,
      message: "¡Excelente Cocinero!",
      prize: "2 Cupones para sorteo",
      condition: "Solo en caja",
      level: "excellent",
      couponPrefix: "R9-PAP"
    };
  }

  if (completedCount === 1) {
    return {
      score: 50,
      message: "¡Buen Intento!",
      prize: "1 Cupón para sorteo",
      condition: "Comprando burger",
      level: "good",
      couponPrefix: "R9-SALS"
    };
  }

  return {
    score: 0,
    message: "¡La plancha se quemó!",
    prize: "Vuelve mañana por otro intento",
    condition: "¡Sigue intentando!",
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
