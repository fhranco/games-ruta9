export const ROULETTE_PRIZES = [
  {
    id: "salsa-gratis",
    label: "SALSA GRATIS",
    condition: "Comprando burger",
    weight: 25,
    color: "#C52026"
  },
  {
    id: "sigue-participando",
    label: "SIGUE JUGANDO",
    condition: "¡Sigue participando!",
    weight: 30,
    color: "#111111"
  },
  {
    id: "papas-gratis",
    label: "PAPAS GRATIS",
    condition: "Solo en caja",
    weight: 15,
    color: "#FFB800"
  },
  {
    id: "sigue-participando",
    label: "SIGUE JUGANDO",
    condition: "¡Sigue participando!",
    weight: 30,
    color: "#111111"
  },
  {
    id: "sorteo-promo",
    label: "3 COPIAS SORTEO",
    condition: "3 cupones de sorteo por promo burger por 2",
    weight: 5,
    color: "#C52026"
  },
  {
    id: "sigue-participando",
    label: "SIGUE JUGANDO",
    condition: "¡Sigue participando!",
    weight: 30,
    color: "#111111"
  },
  {
    id: "salsa-gratis",
    label: "SALSA GRATIS",
    condition: "Comprando burger",
    weight: 25,
    color: "#C52026"
  },
  {
    id: "sigue-participando",
    label: "SIGUE JUGANDO",
    condition: "¡Sigue participando!",
    weight: 30,
    color: "#111111"
  }
];

export function selectWeightedPrize() {
  const totalWeight = ROULETTE_PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < ROULETTE_PRIZES.length; i++) {
    const prize = ROULETTE_PRIZES[i];
    random -= prize.weight;
    if (random <= 0) {
      return { prize, index: i };
    }
  }

  return { prize: ROULETTE_PRIZES[0], index: 0 };
}

export const calculateRotation = (prizeIndex) => {
  const segmentAngle = 360 / ROULETTE_PRIZES.length;
  const extraSpins = 6 + Math.floor(Math.random() * 4);
  const prizeOffset = -(prizeIndex * segmentAngle) - (segmentAngle / 2);
  
  return (extraSpins * 360) + prizeOffset;
};

export function generateRouletteCouponCode() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `R9-RULETA-${day}${month}-${random}`;
}
