import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { useData } from '../context/DataContext';
import WordsPullUpMultiStyle from './animations/WordsPullUpMultiStyle';

const Gallery = () => {
    const { projects } = useData();
    const [selectedProject, setSelectedProject] = useState(null);
    const [isInitialFullscreen, setIsInitialFullscreen] = useState(false);

    const handleProjectClick = (project, startFullscreen = false) => {
        setIsInitialFullscreen(startFullscreen);
        setSelectedProject(project);
    };

    const handleCloseModal = () => {
        setSelectedProject(null);
        setIsInitialFullscreen(false);
    };

    const headerSegments = [
        { text: "Selected ", className: "font-medium text-[#E1E0CC]" },
        { text: "Archive.", className: "italic font-serif text-white/30" }
    ];

    return (
        <section className="py-24 sm:py-32 px-4 md:px-6 w-full relative z-10 bg-black" id="work">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 sm:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-10">
                    <div>
                        <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 block font-sans">Cinematic Portfolio</span>
                        <WordsPullUpMultiStyle 
                            segments={headerSegments}
                            containerClassName="text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-[0.9]"
                        />
                    </div>
                    <div className="hidden md:block">
                        <p className="text-[10px] font-sans text-gray-500 uppercase tracking-[0.2em] text-right">
                            Transmission // V.2.0 <br />
                            Last Updated: 2026.01
                        </p>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg font-sans">No projects found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={handleProjectClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ProjectModal
                project={selectedProject}
                isOpen={!!selectedProject}
                onClose={handleCloseModal}
                initialFullscreen={isInitialFullscreen}
            />
        </section>
    );
};

export default Gallery;
