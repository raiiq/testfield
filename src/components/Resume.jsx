import React from 'react';
import { motion } from 'framer-motion';
import { Download, Briefcase, Cpu, User, Target, Shield, Globe, Award } from 'lucide-react';
import { useData } from '../context/DataContext';
import WordsPullUpMultiStyle from './animations/WordsPullUpMultiStyle';

const Resume = () => {
    const { experience, skills, settings } = useData();

    const professional_title = settings?.professional_title || "Filmmaker | AI Prompt Engineer | Creative Director";
    const hero_bio = settings?.hero_bio || "Iraq-Based Visionary crafting cutting-edge cinematic sequences.";
    const bio_detailed = settings?.bio_detailed || "Iraq-Based Visionary crafting cutting-edge cinematic sequences. I blend the raw power of traditional cinematography with the precision of AI-driven creative systems to deliver visual experiences that reside on the frontier of modern storytelling. Focused on the intersection of generative technology and high-fidelity video production, I serve as a catalyst for brands and studios looking to evolve their narrative capabilities in the post-digital era.";

    const handleDownloadPDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const margin = 20;
        let yPos = 30;

        const addBackground = () => {
            doc.setFillColor(0, 0, 0);
            doc.rect(0, 0, 210, 297, 'F');
        };

        const drawAccentLine = (y) => {
            doc.setDrawColor(222, 219, 200); // #DEDBC8
            doc.setLineWidth(0.5);
            doc.line(margin, y, margin + 5, y);
            doc.setDrawColor(40, 40, 40);
            doc.line(margin + 7, y, 210 - margin, y);
        };

        // Page 1: Profile Overview
        addBackground();

        // Header System Marker
        doc.setTextColor(222, 219, 200);
        doc.setFontSize(8);
        doc.setFont("courier", "bold");
        doc.text("CURRICULUM VITAE // MASTER DOSSIER", margin, 15);

        // Name and Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.setFont("helvetica", "bold");
        doc.text("BARAA BASIM", margin, yPos);

        yPos += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text(professional_title.toUpperCase(), margin, yPos);

        yPos += 6;
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(110, 110, 110);
        doc.text(hero_bio, margin, yPos);

        yPos += 15;
        drawAccentLine(yPos);

        // Strategic Summary
        yPos += 15;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PROFILE SUMMARY", margin, yPos);

        yPos += 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(180, 180, 180);
        const bioLines = doc.splitTextToSize(bio_detailed, 210 - (margin * 2));
        doc.text(bioLines, margin, yPos);
        yPos += (bioLines.length * 6) + 15;

        // Visionary Parameters (Quick Stats)
        drawAccentLine(yPos);
        yPos += 15;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("KEY COMPETENCIES", margin, yPos);

        const stats = [
            { label: "Narrative Depth", pct: 95 },
            { label: "AI Creative Integration", pct: 98 },
            { label: "Cinematographic Fidelity", pct: 92 },
            { label: "Director's Vision", pct: 100 }
        ];

        yPos += 10;
        stats.forEach((stat, i) => {
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(stat.label.toUpperCase(), margin, yPos);
            doc.setTextColor(222, 219, 200);
            doc.text(`${stat.pct}%`, 190 - margin, yPos);

            yPos += 4;
            doc.setDrawColor(40, 40, 40);
            doc.rect(margin, yPos, 170, 1, 'F');
            doc.setFillColor(222, 219, 200);
            doc.rect(margin, yPos, 170 * (stat.pct / 100), 1, 'F');
            yPos += 12;
        });

        // Page 2: Operational History & Technical Arsenal
        doc.addPage();
        yPos = 30;
        addBackground();

        doc.setTextColor(222, 219, 200);
        doc.setFontSize(8);
        doc.setFont("courier", "bold");
        doc.text("OPERATIONAL RECORDS // LOGIC ARSENAL", margin, 15);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PROFESSIONAL EXPERIENCE", margin, yPos);

        experience.forEach(job => {
            yPos += 12;
            if (yPos > 260) { doc.addPage(); addBackground(); yPos = 30; }

            doc.setDrawColor(222, 219, 200);
            doc.rect(margin, yPos, 1, 15, 'F');

            doc.setFontSize(11);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text(`${job.role}`, margin + 5, yPos + 4);

            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`${job.company} // ${job.period}`, margin + 5, yPos + 10);

            yPos += 18;
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.setFont("helvetica", "normal");
            const lines = doc.splitTextToSize(job.description, 210 - (margin * 2) - 5);
            doc.text(lines, margin + 5, yPos);
            yPos += (lines.length * 5) + 5;
        });

        yPos += 15;
        if (yPos > 240) { doc.addPage(); addBackground(); yPos = 30; }

        drawAccentLine(yPos);
        yPos += 15;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("TECHNICAL SKILLS", margin, yPos);

        skills.forEach((group, i) => {
            yPos += 12;
            if (yPos > 270) { doc.addPage(); addBackground(); yPos = 30; }

            doc.setFontSize(10);
            doc.setTextColor(222, 219, 200);
            doc.text(`[ ${group.category.toUpperCase()} ]`, margin, yPos);

            yPos += 6;
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            const skillLine = group.items.join(" // ");
            const lines = doc.splitTextToSize(skillLine, 210 - (margin * 2));
            doc.text(lines, margin, yPos);
            yPos += (lines.length * 5);
        });

        doc.save("baraa-basim-cv-dossier.pdf");
    };

    const headerSegments = [
        { text: "Master ", className: "font-medium text-[#E1E0CC]" },
        { text: "Dossier.", className: "italic font-serif text-white/30" }
    ];

    return (
        <section className="py-12 sm:py-20 md:py-32 px-4 sm:px-6 md:px-12 lg:px-20 relative min-h-screen flex flex-col justify-center overflow-hidden bg-black font-sans" id="resume">
            
            <div className="w-full max-w-7xl mx-auto relative z-10 text-left">
                {/* Global Command Header */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-16 md:mb-24 px-0 sm:px-4">
                    <div className="max-w-3xl space-y-4 sm:space-y-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            style={{ willChange: 'opacity' }}
                            className="flex items-center gap-2 sm:gap-3"
                        >
                            <span className="text-primary text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.4em] sm:tracking-[0.6em]">Curriculum Vitae</span>
                        </motion.div>

                        <WordsPullUpMultiStyle 
                            segments={headerSegments}
                            containerClassName="text-[clamp(2.5rem,10vw,7rem)] sm:text-[clamp(3.5rem,10vw,8rem)] uppercase tracking-tighter leading-[0.85] mb-4 sm:mb-6"
                        />

                        <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] leading-relaxed max-w-xl pl-4 sm:pl-6 border-l border-white/10">
                            A complete overview of professional experience and technical skills for <span className="text-white">Baraa Basim</span>.
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownloadPDF}
                        className="group flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-8 md:px-10 py-4 sm:py-5 bg-[#E1E0CC] text-black rounded-xl sm:rounded-2xl transition-all font-bold uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-white touch-target w-full sm:w-auto"
                    >
                        <Download size={16} className="group-hover:translate-y-1 transition-transform" />
                        <span>Export Dossier (PDF)</span>
                    </motion.button>
                </div>

                {/* Grid Layer 1: Core Profile */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 md:gap-12 mb-6 sm:mb-8 md:mb-12">

                    {/* Strategic Identity */}
                    <div className="lg:col-span-12 xl:col-span-4 h-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-[#101010] border border-white/5 p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden group h-full"
                        >

                            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                <div className="p-3 sm:p-4 bg-primary/10 rounded-xl sm:rounded-2xl">
                                    <User className="text-primary" size={20} />
                                </div>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-white uppercase tracking-tighter">Profile</h3>
                            </div>

                            <div className="space-y-6 sm:space-y-8">
                                <div className="space-y-3 sm:space-y-4">
                                    <p className="text-lg sm:text-xl md:text-2xl text-[#E1E0CC] font-medium leading-tight uppercase tracking-tighter">
                                        {professional_title}
                                    </p>
                                    <div className="h-px w-12 sm:w-20 bg-primary/30" />
                                </div>

                                <p className="text-gray-400 text-[13px] sm:text-base leading-relaxed font-medium">
                                    {bio_detailed}
                                </p>

                                <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-6 sm:mt-8">
                                    {[
                                        { icon: Globe, label: "Origin", val: "Iraq" },
                                        { icon: Target, label: "Objective", val: "Innovation" },
                                        { icon: Shield, label: "Identity", val: "Verified" },
                                        { icon: Award, label: "Status", val: "Active" }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col gap-2">
                                            <stat.icon className="text-primary/40" size={14} />
                                            <div>
                                                <p className="text-[7px] sm:text-[8px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</p>
                                                <p className="text-[#E1E0CC] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{stat.val}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Operational History */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-6 sm:space-y-8">
                        <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4 px-2 sm:px-4">
                            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
                                <Briefcase className="text-primary" size={18} />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-medium text-white uppercase tracking-tighter">Experience</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {experience.map((job, index) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    className="group bg-[#101010] border border-white/5 p-5 sm:p-8 md:p-10 rounded-xl sm:rounded-[2rem] md:rounded-[2.5rem] hover:bg-white/[0.03] hover:border-primary/20 transition-all duration-700 flex flex-col"
                                >
                                    <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                <span className="text-primary text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase">{job.period}</span>
                                            </div>
                                            <h4 className="text-xl sm:text-2xl md:text-3xl font-medium text-[#E1E0CC] uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">
                                                {job.role}
                                            </h4>
                                            <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mt-1 sm:mt-2">{job.company}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-medium">
                                        {job.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Technical Arsenal - Moved Under Operational History */}
                        <div className="pt-10 sm:pt-16 md:pt-20 border-t border-white/5 space-y-6 sm:space-y-8 mt-6 sm:mt-8 md:mt-12">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4 px-2 sm:px-4">
                                <div className="p-2 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
                                    <Cpu className="text-primary" size={18} />
                                </div>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-white uppercase tracking-tighter">Skills & Software</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {skills.map((group, index) => (
                                    <motion.div
                                        key={group.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.6 }}
                                        className="group bg-[#101010] border border-white/5 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-[2rem] md:rounded-[2.5rem] flex flex-col h-full"
                                    >
                                        <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg sm:text-xl md:text-2xl font-medium text-[#E1E0CC] uppercase tracking-tighter leading-none">
                                                    {group.category.replace('_', ' ')}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-auto">
                                            {group.items.map((skill, sIdx) => (
                                                <span
                                                    key={sIdx}
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold text-gray-300 uppercase tracking-[0.1em]"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FULL WIDTH: STRATEGIC OUTPUT */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-6 sm:mb-8 md:mb-12 bg-[#101010] border border-white/5 p-5 sm:p-8 md:p-12 lg:p-20 rounded-2xl sm:rounded-[2.5rem] md:rounded-[4rem] relative overflow-hidden"
                >

                    <div className="flex flex-col xl:flex-row gap-10 sm:gap-16 md:gap-20">
                        {/* Header & Visionary Stats */}
                        <div className="xl:w-1/3 space-y-8 sm:space-y-12">
                            <div className="space-y-4 sm:space-y-6">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span className="text-primary text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em]">Strategic Output</span>
                                </div>
                                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#E1E0CC] uppercase tracking-tighter leading-none">
                                    Creative <br /><span className="text-white/20 italic font-serif">Aptitude.</span>
                                </h3>
                                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed uppercase tracking-widest font-medium opacity-60">
                                    A unified quantification of creative architecture and technical mastery, summarizing the core philosophical and operational drive.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:gap-8">
                                {[
                                    { label: "Narrative Depth", pct: "95%", desc: "Emotional resonance and structural complexity." },
                                    { label: "AI Creative Integration", pct: "98%", desc: "Neural network efficiency in creative workflows." },
                                    { label: "Cinematographic Fidelity", pct: "92%", desc: "Visual precision and technical execution protocols." },
                                    { label: "Director's Vision", pct: "100%", desc: "Absolute adherence to primary objectives." }
                                ].map((stat, i) => (
                                    <div key={i} className="space-y-3 sm:space-y-4 group">
                                        <div className="flex justify-between items-end gap-2">
                                            <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                                                <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest group-hover:text-primary transition-colors block truncate">{stat.label}</span>
                                                <p className="text-[7px] sm:text-[8px] text-gray-500 font-bold uppercase tracking-widest truncate">{stat.desc}</p>
                                            </div>
                                            <span className="text-lg sm:text-xl font-medium text-primary tracking-tighter flex-shrink-0">{stat.pct}</span>
                                        </div>
                                        <div className="h-[2px] w-full bg-white/5 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: stat.pct }}
                                                transition={{ duration: 2, delay: i * 0.1 }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Technical Mastery Dashboard */}
                        <div className="xl:w-2/3">
                            <div className="bg-black border border-white/5 p-5 sm:p-8 md:p-12 lg:p-16 rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] h-full flex flex-col justify-center">
                                <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-12">
                                    <h4 className="text-lg sm:text-xl font-medium text-[#E1E0CC] uppercase tracking-tighter">Technical Mastery Index</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 sm:gap-x-12 md:gap-x-16 gap-y-8 sm:gap-y-12">
                                    {skills.map((group, i) => {
                                        const ratings = {
                                            'AI Creative Suite': '98%',
                                            'Cinematic Production': '95%',
                                            'Technical Gear': '92%',
                                            'Post-Production': '94%',
                                            'default': '90%'
                                        };
                                        const pct = ratings[group.category] || ratings['default'];

                                        return (
                                            <div key={group.id} className="space-y-4 sm:space-y-6">
                                                <div className="flex justify-between items-end gap-2">
                                                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                                                        <span className="text-primary text-[9px] sm:text-[10px]">{`0${i + 1}.`}</span>
                                                        <p className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest truncate">{group.category.replace('_', ' ')}</p>
                                                    </div>
                                                    <span className="text-xl sm:text-2xl font-medium text-[#E1E0CC]/40 tracking-tighter flex-shrink-0">{pct}</span>
                                                </div>
                                                <div className="h-[2px] w-full bg-white/5 relative">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: pct }}
                                                        transition={{ duration: 2, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                                                        className="h-full bg-primary relative"
                                                    >
                                                    </motion.div>
                                                </div>
                                                <p className="text-[7px] sm:text-[8px] text-gray-600 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                                                    Index Optimized
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default Resume;
