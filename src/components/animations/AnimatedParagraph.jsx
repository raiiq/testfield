import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const AnimatedLetter = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
};

const AnimatedParagraph = ({ text, className }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2']
  });

  const chars = text.split('');
  
  return (
    <p ref={ref} className={className}>
      {chars.map((char, i) => {
        const charProgress = i / chars.length;
        // Range to transition opacity from 0.2 to 1
        const range = [charProgress - 0.1, charProgress + 0.05];
        return (
          <AnimatedLetter key={i} progress={scrollYProgress} range={range}>
            {char}
          </AnimatedLetter>
        );
      })}
    </p>
  );
};

export default AnimatedParagraph;
