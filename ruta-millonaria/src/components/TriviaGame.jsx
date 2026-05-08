import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Zap, Lightbulb, Clock } from 'lucide-react';
import { sounds } from '../utils/sounds';

export default function TriviaGame({ questions, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(15);
  const [comodines, setComodines] = useState({ fifty: true, hint: true });
  const [disabledOptions, setDisabledOptions] = useState([]);
  const [showHint, setShowHint] = useState(false);
  
  const currentQuestion = questions[currentIndex];
  const timerRef = useRef();

  useEffect(() => {
    // La música se gestiona desde el componente padre para evitar cortes entre preguntas
  }, []);

  useEffect(() => {
    if (!isAnswered && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !isAnswered) {
      handleAnswer(null);
    }
    return () => clearInterval(timerRef.current);
  }, [timer, isAnswered]);

  const handleAnswer = (optionKey) => {
    if (isAnswered) return;
    clearInterval(timerRef.current);
    setSelectedOption(optionKey);
    setIsAnswered(true);

    if (optionKey === currentQuestion.answer) {
      sounds.playCorrect();
      setCorrectCount(prev => prev + 1);
    } else {
      sounds.playWrong();
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setTimer(15);
        setDisabledOptions([]);
        setShowHint(false);
      } else {
        onFinish(optionKey === currentQuestion.answer ? correctCount + 1 : correctCount);
      }
    }, 2000);
  };

  const useFiftyFifty = () => {
    if (!comodines.fifty || isAnswered) return;
    setComodines({ ...comodines, fifty: false });
    
    const options = ['A', 'B', 'C', 'D'];
    const incorrect = options.filter(o => o !== currentQuestion.answer);
    const toDisable = incorrect.sort(() => Math.random() - 0.5).slice(0, 2);
    setDisabledOptions(toDisable);
  };

  const useHint = () => {
    if (!comodines.hint || isAnswered) return;
    setComodines({ ...comodines, hint: false });
    setShowHint(true);
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-8 relative">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-white/40">Pregunta</p>
          <p className="text-xl font-black">{currentIndex + 1} <span className="text-white/20">/ {questions.length}</span></p>
        </div>
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black ${timer < 5 ? 'border-r9-red text-r9-red animate-pulse' : 'border-white/20 text-white'}`}>
                {timer}
            </div>
            <Clock size={20} className="opacity-20" />
        </div>
      </div>

      {/* Question Card */}
      <motion.div 
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="quiz-card p-10 min-h-[250px] flex flex-col justify-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <motion.div 
                className="h-full bg-r9-gold"
                initial={{ width: 0 }}
                animate={{ width: `${(currentIndex / questions.length) * 100}%` }}
            />
        </div>
        <h2 className="text-2xl font-bold leading-tight tracking-tight">
          {currentQuestion.question}
        </h2>
        
        {showHint && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 p-4 bg-r9-gold/10 border border-r9-gold/20 rounded-xl text-r9-gold text-sm italic"
            >
                Pista: {currentQuestion.explanation.replace('La respuesta correcta es ', '')}
            </motion.div>
        )}
      </motion.div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-4">
        {['A', 'B', 'C', 'D'].map((opt, i) => (
          <button
            key={opt}
            disabled={isAnswered || disabledOptions.includes(opt)}
            onClick={() => handleAnswer(opt)}
            className={`option-btn ${disabledOptions.includes(opt) ? 'opacity-20 grayscale cursor-not-allowed' : ''} 
                ${isAnswered && opt === currentQuestion.answer ? 'option-btn-correct' : ''}
                ${isAnswered && selectedOption === opt && opt !== currentQuestion.answer ? 'option-btn-wrong' : ''}
                ${!isAnswered && selectedOption === opt ? 'border-r9-gold bg-r9-gold/10' : ''}
            `}
          >
            <span className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-black text-sm border border-white/5">
                {opt}
            </span>
            <span className="flex-1 font-medium">{currentQuestion.options[i]}</span>
          </button>
        ))}
      </div>

      {/* Comodines */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={useFiftyFifty}
          disabled={!comodines.fifty || isAnswered}
          className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all
            ${comodines.fifty ? 'bg-r9-charcoal border-white/10 text-white active:scale-95' : 'bg-transparent border-white/5 text-white/10'}
          `}
        >
          <Zap size={24} className={comodines.fifty ? 'text-r9-gold' : ''} />
          <span className="text-[10px] font-black uppercase tracking-widest">50/50</span>
        </button>
        <button 
          onClick={useHint}
          disabled={!comodines.hint || isAnswered}
          className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all
            ${comodines.hint ? 'bg-r9-charcoal border-white/10 text-white active:scale-95' : 'bg-transparent border-white/5 text-white/10'}
          `}
        >
          <Lightbulb size={24} className={comodines.hint ? 'text-r9-gold' : ''} />
          <span className="text-[10px] font-black uppercase tracking-widest">Pista</span>
        </button>
      </div>
    </div>
  );
}
