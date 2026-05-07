import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const phrases = [
    "Initializing Cinematic AI...",
    "Analyzing Profile Data...",
    "Structuring Professional Narrative...",
    "Applying Design Aesthetics...",
    "Polishing Typography...",
    "Finalizing Masterpiece..."
];

const AILoader = ({ isVisible }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % phrases.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
                >
                    {/* Glowing animated orb */}
                    <div className="relative flex items-center justify-center w-32 h-32 mb-8">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                                rotate: [0, 90, 180, 270, 360]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.3, 0.8, 0.3],
                                rotate: [360, 270, 180, 90, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                        />
                        <Sparkles className="text-white w-8 h-8 relative z-10 animate-pulse" />
                    </div>

                    {/* Dynamic Text */}
                    <div className="h-12 relative flex items-center justify-center overflow-hidden w-full max-w-md">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={index}
                                initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="absolute text-center text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300 tracking-[0.2em] uppercase"
                                dir="auto"
                            >
                                {phrases[index]}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Progress Bar (Fake but soothing) */}
                    <div className="w-64 h-1 bg-white/10 rounded-full mt-6 overflow-hidden relative">
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AILoader;
