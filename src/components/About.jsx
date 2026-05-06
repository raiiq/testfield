import React from 'react';
import WordsPullUpMultiStyle from './animations/WordsPullUpMultiStyle';
import AnimatedParagraph from './animations/AnimatedParagraph';
import { useData } from '../context/DataContext';

const About = () => {
  const { settings } = useData();

  const segments = [
    { text: "I am Baraa Basim, ", className: "font-normal font-sans" },
    { text: "a cinematic director. ", className: "italic font-serif" },
    { text: "I specialize in high-fidelity storytelling.", className: "font-normal font-sans" }
  ];

  const bioText = settings?.bio_detailed || "Over the last few years, I have worked with international production houses that craft cinema and series. Together, we have created work that pushes the boundaries of modern cinematography and visual storytelling from Iraq to the world.";

  return (
    <section id="about" className="bg-black py-24 sm:py-32 px-4 md:px-6 w-full">
      <div className="bg-[#101010] rounded-2xl md:rounded-[2rem] max-w-6xl mx-auto p-8 sm:p-12 md:p-20 flex flex-col items-center text-center">
        <span className="text-primary text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-8 font-sans font-bold">Visual arts</span>
        
        <WordsPullUpMultiStyle 
          segments={segments} 
          containerClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-4xl mx-auto leading-[0.95] sm:leading-[0.9] justify-center text-[#E1E0CC]"
        />

        <div className="mt-12 sm:mt-24 max-w-2xl mx-auto">
          <AnimatedParagraph 
            text={bioText}
            className="text-[#DEDBC8] text-xs sm:text-sm md:text-base leading-relaxed font-sans"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
