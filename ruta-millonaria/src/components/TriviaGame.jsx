import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Zap, Lightbulb, Clock, Check, X as CloseIcon } from 'lucide-react';
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
    if (!isAnswered && timer > 0) {
      if (timer <= 5) {
        sounds.playTick();
      }
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !isAnswered) {
      handleAnswer(null);
    }
    return () => clearInterval(timerRef.current);
  }, [timer, isAnswered]);

  const handleAnswer = (optionKey, e) => {
    if (e) e.preventDefault();
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

  const useFiftyFifty = (e) => {
    if (e) e.preventDefault();
    if (!comodines.fifty || isAnswered) return;
    setComodines({ ...comodines, fifty: false });
    
    const options = ['A', 'B', 'C', 'D'];
    const incorrect = options.filter(o => o !== currentQuestion.answer);
    const toDisable = incorrect.sort(() => Math.random() - 0.5).slice(0, 2);
    setDisabledOptions(toDisable);
  };

  const useHint = (e) => {
    if (e) e.preventDefault();
    if (!comodines.hint || isAnswered) return;
    setComodines({ ...comodines, hint: false });
    setShowHint(true);
  };

  // Círculo SVG del temporizador
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timer / 15) * circumference;

  // Cambiar el color del temporizador dependiendo del tiempo restante
  const getTimerColor = () => {
    if (timer <= 4) return 'stroke-[#C52026]';
    if (timer <= 8) return 'stroke-[#FFB800]';
    return 'stroke-emerald-500';
  };

  const getTimerGlow = () => {
    if (timer <= 4) return 'drop-shadow-[0_0_8px_rgba(197,32,38,0.5)]';
    if (timer <= 8) return 'drop-shadow-[0_0_8px_rgba(255,184,0,0.5)]';
    return 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]';
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-8 relative max-w-xl mx-auto justify-center h-full">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-md shadow-lg">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30">Progreso</span>
          <div className="flex items-end gap-1.5 mt-1">
            <span className="text-3xl font-black italic tracking-tighter leading-none text-white">{currentIndex + 1}</span>
            <span className="text-sm font-bold text-white/20 mb-0.5">/ {questions.length}</span>
          </div>
        </div>

        {/* Circular SVG Timer */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Círculo de fondo */}
            <circle 
              cx="32" 
              cy="32" 
              r={radius} 
              className="stroke-white/10 fill-none" 
              strokeWidth="4.5"
            />
            {/* Círculo de progreso animado */}
            <circle 
              cx="32" 
              cy="32" 
              r={radius} 
              className={`fill-none transition-all duration-1000 ease-linear ${getTimerColor()} ${getTimerGlow()}`}
              strokeWidth="4.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-md font-black font-mono tracking-tight transition-colors ${timer <= 4 ? 'text-[#C52026] animate-pulse' : 'text-white'}`}>
              {timer}
            </span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <motion.div 
        key={currentIndex}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="quiz-card p-10 min-h-[220px] flex flex-col justify-center relative overflow-hidden glass-card"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#C52026] to-[#FFB800]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <h2 className="text-2xl font-black leading-tight tracking-tight text-white/95">
          {currentQuestion.question}
        </h2>
        
        <AnimatePresence>
          {showHint && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }} 
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="p-5 bg-[#FFB800]/10 border border-[#FFB800]/20 rounded-3xl text-[#FFB800] text-xs font-semibold leading-relaxed italic"
            >
              💡 Pista: {currentQuestion.explanation.replace('La respuesta correcta es ', '')}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-4">
        {['A', 'B', 'C', 'D'].map((opt, i) => {
          const isCorrect = opt === currentQuestion.answer;
          const isSelected = selectedOption === opt;
          
          return (
            <button
              key={opt}
              disabled={isAnswered || disabledOptions.includes(opt)}
              onPointerDown={(e) => handleAnswer(opt, e)}
              className={`option-btn select-none touch-none ${disabledOptions.includes(opt) ? 'opacity-10 grayscale cursor-not-allowed border-transparent bg-transparent' : ''} 
                ${isAnswered && isCorrect ? 'option-btn-correct' : ''}
                ${isAnswered && isSelected && !isCorrect ? 'option-btn-wrong' : ''}
                ${isAnswered && !isCorrect && !isSelected ? 'opacity-40 scale-[0.98]' : ''}
                ${!isAnswered && isSelected ? 'border-[#FFB800] bg-[#FFB800]/10 shadow-[0_0_15px_rgba(255,184,0,0.15)]' : ''}
              `}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border transition-all shrink-0
                ${isAnswered && isCorrect ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : ''}
                ${isAnswered && isSelected && !isCorrect ? 'bg-[#C52026]/20 border-[#C52026] text-[#C52026]' : ''}
                ${!isAnswered ? 'bg-white/5 border-white/10 text-white/60 group-hover:border-[#FFB800]/30' : ''}
              `}>
                {isAnswered && isCorrect ? <Check size={16} /> : opt}
              </span>
              <span className="flex-1 font-semibold text-sm leading-snug">{currentQuestion.options[i]}</span>
            </button>
          );
        })}
      </div>

      {/* Comodines / Lifelines */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button 
          onPointerDown={useFiftyFifty}
          disabled={!comodines.fifty || isAnswered}
          className={`p-5 rounded-3xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer shadow-lg select-none touch-none
            ${comodines.fifty && !isAnswered
              ? 'bg-[#111111]/70 border-white/10 text-white hover:border-[#FFB800]/30 hover:bg-[#FFB800]/5 active:scale-95' 
              : 'bg-transparent border-white/5 text-white/10 cursor-not-allowed'
            }
          `}
        >
          <Zap size={22} className={comodines.fifty && !isAnswered ? 'text-[#FFB800] drop-shadow-[0_0_8px_rgba(255,184,0,0.4)]' : ''} />
          <span className="text-[9px] font-black uppercase tracking-widest">Comodín 50/50</span>
        </button>
        <button 
          onPointerDown={useHint}
          disabled={!comodines.hint || isAnswered}
          className={`p-5 rounded-3xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer shadow-lg select-none touch-none
            ${comodines.hint && !isAnswered
              ? 'bg-[#111111]/70 border-white/10 text-white hover:border-[#FFB800]/30 hover:bg-[#FFB800]/5 active:scale-95' 
              : 'bg-transparent border-white/5 text-white/10 cursor-not-allowed'
            }
          `}
        >
          <Lightbulb size={22} className={comodines.hint && !isAnswered ? 'text-[#FFB800] drop-shadow-[0_0_8px_rgba(255,184,0,0.4)]' : ''} />
          <span className="text-[9px] font-black uppercase tracking-widest">Solicitar Pista</span>
        </button>
      </div>
    </div>
  );
}
