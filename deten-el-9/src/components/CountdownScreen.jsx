import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/sounds';

export default function CountdownScreen({ onFinished }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      sounds.playBeep(false);
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      sounds.playBeep(true);
      const timer = setTimeout(onFinished, 500);
      return () => clearTimeout(timer);
    }
  }, [count, onFinished]);

  return (
    <div className="h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="text-[15rem] font-black text-r9-red text-glow-red italic"
        >
          {count > 0 ? count : '¡YA!'}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
