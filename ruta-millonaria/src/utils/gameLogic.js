import { triviaQuestions } from './triviaQuestionBank';

export function selectTriviaRound() {
  const easy = triviaQuestions.filter(q => q.difficulty.includes("Fácil"));
  const medium = triviaQuestions.filter(q => q.difficulty.includes("Media") && !q.difficulty.includes("Fácil"));
  const hard = triviaQuestions.filter(q => q.difficulty.includes("Alta") || q.difficulty.includes("Experta") || q.difficulty.includes("Premium"));

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  // Seleccionamos 1 fácil, 2 medias, 2 difíciles (o cercanas)
  const shuffledEasy = shuffle(easy);
  const shuffledMedium = shuffle(medium);
  const shuffledHard = shuffle(hard);

  const round = [
    shuffledEasy[0],
    shuffledMedium[0],
    shuffledMedium[1] || shuffledEasy[1],
    shuffledHard[0],
    shuffledHard[1] || shuffledMedium[2]
  ].filter(Boolean);

  return round.slice(0, 5);
}

export function calculateTriviaResult(correctAnswers) {
  if (correctAnswers >= 5) {
    return {
      score: 100,
      levelName: "Maestro de la Carta",
      message: "Dominaste la carta Ruta9",
      prize: "Participas por Promo Burger + Bebida para 2 personas",
      condition: "Canjeable en caja",
      level: "master",
      couponPrefix: "R9-TRIVIA"
    };
  }

  if (correctAnswers === 4) {
    return {
      score: 90,
      levelName: "Experto Ruta9",
      message: "Conoces muy bien la carta",
      prize: "2 Cupones para sorteo",
      condition: "Solo en caja",
      level: "expert",
      couponPrefix: "R9-TRIVIA"
    };
  }

  if (correctAnswers === 3) {
    return {
      score: 75,
      levelName: "Fan Ruta9",
      message: "Buen conocimiento de la carta",
      prize: "1 Cupón para sorteo",
      condition: "Comprando burger",
      level: "fan",
      couponPrefix: "R9-TRIVIA"
    };
  }

  return {
    score: 10,
    levelName: "Visitante Ruta9",
    message: "¡Sigue participando!",
    prize: "Vuelve mañana por otro intento",
    condition: "Sigue jugando para ganar",
    level: "visitor",
    couponPrefix: "R9-TRIVIA"
  };
}

export function generateCouponCode(prefix) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${day}${month}-${random}`;
}
