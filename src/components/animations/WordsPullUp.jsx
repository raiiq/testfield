import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const WordsPullUp = ({ text, className, showAsterisk = false }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' });
  const words = text.split(' ');

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) => {
        const isLastWord = i === words.length - 1;
        return (
          <div key={i} className="overflow-hidden mr-[0.25em] last:mr-0 inline-block relative">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.08,
              }}
              className="inline-block relative"
            >
              {word}
              {showAsterisk && isLastWord && (
                <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
              )}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
};

export default WordsPullUp;
