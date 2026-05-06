import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Maximize } from 'lucide-react';

const ProjectCard = ({ project, onClick }) => {
    const handleYoutubeClick = (e) => {
        e.stopPropagation();
        const youtubeUrl = project.video?.includes('youtube.com/embed/')
            ? project.video.replace('embed/', 'watch?v=')
            : project.video;
        window.open(youtubeUrl, '_blank');
    };

    const handleFullscreenClick = (e) => {
        e.stopPropagation();
        onClick(project, true);
    };

    return (
        <motion.div
            onClick={() => onClick(project)}
            className="group flex flex-col cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Image Container */}
            <div className="relative w-full aspect-[4/3] sm:aspect-video overflow-hidden rounded-2xl md:rounded-3xl bg-[#101010] border border-white/5 shadow-2xl mb-6">
                <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.03] ease-out-expo grayscale-[0.2] group-hover:grayscale-0"
                />
                
                {/* Actions Overlay */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <button
                        onClick={handleFullscreenClick}
                        className="p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-primary transition-colors touch-target"
                    >
                        <Maximize size={16} />
                    </button>
                    {project.video && (
                        <button
                            onClick={handleYoutubeClick}
                            className="p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-[#FF0000] transition-colors touch-target"
                        >
                            <Youtube size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col gap-2 font-sans px-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">00{project.id}</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">{project.category}</span>
                    </div>
                    {project.release_date && (
                        <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">
                            {new Date(project.release_date).toLocaleDateString('en-US', { year: 'numeric' })}
                        </span>
                    )}
                </div>
                
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-medium text-[#E1E0CC] leading-[1.1] uppercase tracking-tighter mt-1" style={{ fontFamily: project.font || 'Almarai' }}>
                    {project.title}
                </h3>
                
                <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs sm:text-sm text-gray-400 font-sans tracking-wide">{project.role}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectCard;
