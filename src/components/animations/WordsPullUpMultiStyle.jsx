import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const WordsPullUpMultiStyle = ({ segments, containerClassName }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' });
  
  const words = [];
  segments.forEach(segment => {
    const segmentWords = segment.text.split(' ').filter(w => w !== '');
    segmentWords.forEach(word => {
      words.push({ text: word, className: segment.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${containerClassName}`}>
      {words.map((wordObj, i) => (
        <div key={i} className="overflow-hidden mr-[0.25em] last:mr-0 inline-block">
          <motion.span
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: i * 0.08,
            }}
            className={`inline-block ${wordObj.className}`}
          >
            {wordObj.text}
          </motion.span>
        </div>
      ))}
    </div>
  );
};

export default WordsPullUpMultiStyle;
