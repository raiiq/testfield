import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WordsPullUp from './animations/WordsPullUp';
import { useData } from '../context/DataContext';

const Hero = () => {
  const { settings } = useData();

  return (
    <div id="hero" className="w-full h-screen p-4 md:p-6 bg-black">
      <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-surface">
        {/* Background Video */}
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 noise-overlay opacity-[0.7] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12 z-20">
           <div className="grid grid-cols-12 gap-4 items-end">
             {/* Left Column - Heading */}
             <div className="col-span-12 md:col-span-8">
               <WordsPullUp 
                 text="Baraa Basim" 
                 showAsterisk={true}
                 className="text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw] font-medium leading-[0.85] tracking-[-0.07em] text-[#E1E0CC] justify-start"
               />
             </div>
             
             {/* Right Column - Text & CTA */}
             <div className="col-span-12 md:col-span-4 flex flex-col items-start md:pb-4">
               <motion.p 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                 className="text-primary/70 text-xs sm:text-sm md:text-base leading-[1.2] mb-6 max-w-sm font-sans"
               >
                 {settings?.hero_bio || "Iraq-Based Visionary crafting cutting-edge cinematic sequences and narratives."}
               </motion.p>
               
               <motion.button
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                 className="group flex items-center bg-primary rounded-full pl-6 pr-2 py-2 gap-4 hover:gap-6 transition-all"
               >
                 <span className="text-black font-medium text-sm sm:text-base font-sans">Initialize showreel</span>
                 <div className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <ArrowRight className="text-primary w-4 h-4" />
                 </div>
               </motion.button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
