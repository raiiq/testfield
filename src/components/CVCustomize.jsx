import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Save, Printer, Plus, ArrowUp, ArrowDown, Trash2, FileText, X, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';

const CVCustomize = () => {
    const { user, login } = useAuth();
    const [cvName, setCvName] = useState('My Cinematic CV');
    
    // Multi-page Structure
    const [pages, setPages] = useState([
        {
            id: 'page_1',
            layers: [
                { id: 'l_1', type: 'header', data: { name: 'Your Name', title: 'Professional Title', email: 'email@example.com', phone: '+1 234 567 8900' } },
                { id: 'l_2', type: 'about', data: { text: 'A brief professional summary about your career objectives and skills.' } }
            ]
        }
    ]);
    const [activePageIndex, setActivePageIndex] = useState(0);

    const [history, setHistory] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // AI Integration
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Notifications
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    
    // Mobile sidebar
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const showToast = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('user_cvs')
                .select('*')
                .order('updated_at', { ascending: false });
            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching CV history:', error);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const cvData = {
                user_id: user.id,
                cv_name: cvName,
                ai_prompt: aiPrompt,
                layers: pages // saving pages array directly to 'layers' column
            };

            if (selectedId) {
                const { error } = await supabase.from('user_cvs').update(cvData).eq('id', selectedId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('user_cvs').insert([cvData]).select();
                if (error) throw error;
                if (data && data[0]) setSelectedId(data[0].id);
            }
            await fetchHistory();
            showToast('CV Saved Successfully', 'success');
        } catch (error) {
            console.error('Error saving CV:', error);
            showToast('Failed to save CV', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const loadCV = (cv) => {
        setSelectedId(cv.id);
        setCvName(cv.cv_name);
        setAiPrompt(cv.ai_prompt || '');
        
        // Handle backwards compatibility if someone saved the old flat layers
        if (cv.layers && cv.layers.length > 0 && !cv.layers[0].layers) {
            setPages([{ id: 'page_legacy', layers: cv.layers }]);
        } else {
            setPages(cv.layers || [{ id: 'page_1', layers: [] }]);
        }
        setActivePageIndex(0);
        setShowHistory(false);
        showToast('CV Loaded', 'success');
    };

    const createNewCV = () => {
        setSelectedId(null);
        setCvName('New CV');
        setAiPrompt('');
        setPages([{ id: Date.now().toString(), layers: [{ id: Date.now().toString()+'h', type: 'header', data: { name: '', title: '', email: '', phone: '' } }] }]);
        setActivePageIndex(0);
        setShowHistory(false);
    };

    const deleteCV = async (e, id) => {
        e.stopPropagation();
        if(!confirm('Are you sure you want to delete this CV?')) return;
        try {
            const { error } = await supabase.from('user_cvs').delete().eq('id', id);
            if(error) throw error;
            if(selectedId === id) createNewCV();
            await fetchHistory();
            showToast('CV Deleted', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to delete', 'error');
        }
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return showToast('Please enter your details first', 'error');
        setIsGenerating(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GROQ_API_KEY;
            
            // If they are still using the Groq key placeholder or no key, we show a friendly error
            if (!apiKey || apiKey.startsWith('gsk_')) {
                showToast('Please configure your VITE_GEMINI_API_KEY in .env file', 'error');
                setIsGenerating(false);
                return;
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{
                            text: `You are an expert CV generator. Output ONLY valid JSON, nothing else. 
Format must be exactly this structure:
[
  {
    "id": "page_1",
    "layers": [
      { "id": "l_1", "type": "header", "data": { "name": "...", "title": "...", "email": "...", "phone": "..." } },
      { "id": "l_2", "type": "about", "data": { "text": "Professional summary expanding on the user's input." } },
      { "id": "l_3", "type": "experience", "data": { "role": "...", "company": "...", "period": "...", "desc": "Expand into detailed bullet points." } },
      { "id": "l_4", "type": "skills", "data": { "category": "Technical", "items": "skill1, skill2, ..." } }
    ]
  }
]
The user will give you their info. Invent realistic placeholder details (like company, period, phone) if missing, but keep it professional.
IMPORTANT INSTRUCTION FOR LANGUAGE: You MUST generate all the CV content in the Arabic language by default, or match the user's input language. Ensure high-quality, professional phrasing. Return ONLY the pure JSON array, with no markdown formatting.`
                        }]
                    },
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: aiPrompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("Gemini API Error:", errText);
                throw new Error('Failed to reach Gemini API');
            }
            
            const result = await response.json();
            const content = result.candidates[0].content.parts[0].text;
            
            const generatedPages = JSON.parse(content);
            
            const safePages = generatedPages.map((p, pIdx) => ({
                id: `page_${Date.now()}_${pIdx}`,
                layers: (p.layers || []).map((l, lIdx) => ({
                    ...l,
                    id: `layer_${Date.now()}_${pIdx}_${lIdx}`
                }))
            }));

            setPages(safePages);
            setActivePageIndex(0);
            showToast('Magic CV Generated!', 'success');
        } catch (error) {
            console.error('AI Generation error:', error);
            showToast('AI failed to generate CV. Try again.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < pages.length; i++) {
                const element = document.getElementById(`export-page-${i}`);
                if (!element) continue;

                // High-res scaling for pristine text quality
                const scale = 2;
                const opt = {
                    quality: 1,
                    width: element.offsetWidth * scale,
                    height: element.offsetHeight * scale,
                    style: {
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        width: `${element.offsetWidth}px`,
                        height: `${element.offsetHeight}px`
                    }
                };

                const dataUrl = await domtoimage.toJpeg(element, opt);
                
                if (i > 0) {
                    pdf.addPage();
                }
                pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }

            pdf.save(`${cvName.replace(/\s+/g, '_')}.pdf`);
            showToast('PDF Downloaded', 'success');
        } catch (error) {
            console.error('Export Error:', error);
            showToast('Failed to generate PDF. Try again.', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    // --- Page Management ---
    const addPage = () => {
        if (pages.length >= 10) {
            showToast('Maximum 10 pages allowed', 'error');
            return;
        }
        setPages([...pages, { id: Date.now().toString(), layers: [] }]);
        setActivePageIndex(pages.length);
    };

    const removePage = (index) => {
        if (pages.length === 1) {
            showToast('Cannot delete the last page', 'error');
            return;
        }
        const newPages = pages.filter((_, i) => i !== index);
        setPages(newPages);
        setActivePageIndex(Math.max(0, index - 1));
    };

    // --- Layer Management (on Active Page) ---
    const getActiveLayers = () => pages[activePageIndex]?.layers || [];

    const updateActivePageLayers = (newLayers) => {
        const newPages = [...pages];
        newPages[activePageIndex].layers = newLayers;
        setPages(newPages);
    };

    const addLayer = (type) => {
        const newLayer = { id: Date.now().toString(), type, data: {} };
        if(type === 'header') newLayer.data = { name: '', title: '', email: '', phone: '' };
        if(type === 'about') newLayer.data = { text: '' };
        if(type === 'skills') newLayer.data = { category: 'Skills', items: '' };
        if(type === 'experience') newLayer.data = { role: '', company: '', period: '', desc: '' };
        
        updateActivePageLayers([...getActiveLayers(), newLayer]);
    };

    const updateLayer = (id, key, value) => {
        updateActivePageLayers(getActiveLayers().map(l => l.id === id ? { ...l, data: { ...l.data, [key]: value } } : l));
    };

    const moveLayer = (index, direction) => {
        const layers = getActiveLayers();
        const newLayers = [...layers];
        if (direction === 'up' && index > 0) {
            [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
        } else if (direction === 'down' && index < layers.length - 1) {
            [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
        }
        updateActivePageLayers(newLayers);
    };

    const removeLayer = (id) => {
        updateActivePageLayers(getActiveLayers().filter(l => l.id !== id));
    };

    if (!user) {
        return (
            <section className="pt-32 pb-20 px-6 min-h-screen bg-black flex items-center justify-center font-sans no-print">
                <div className="bg-[#101010] border border-white/5 rounded-3xl p-10 text-center max-w-md w-full shadow-2xl">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                        <Lock size={32} className="text-gray-500" />
                    </div>
                    <h2 className="text-2xl font-medium text-[#E1E0CC] uppercase tracking-tighter mb-4">Access Restricted</h2>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8">
                        The CV Customizer is securely locked. Please link your Google account to access your saved CVs and generate perfect native PDFs.
                    </p>
                    <button
                        onClick={login}
                        className="inline-flex items-center justify-center gap-3 bg-[#E1E0CC] text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] w-full hover:bg-white transition-colors"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale" />
                        Link Google ID
                    </button>
                </div>
            </section>
        );
    }

    return (
        <>
            {/* No global print styles needed anymore, export is handled by html2pdf directly */}

            {/* Notification Toast */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#101010] border border-white/10 px-6 py-3 rounded-2xl shadow-2xl no-print"
                    >
                        {notification.type === 'success' ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-500" />}
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="pt-24 sm:pt-32 lg:pt-40 pb-10 min-h-screen bg-black font-sans flex flex-col no-print">
                <div className="max-w-[1800px] mx-auto w-full px-4 lg:px-6 flex-1 flex flex-col xl:flex-row gap-6 relative">
                    
                    {/* LEFT: LAYER EDITOR (col-3 xl) - Adjusted for 11 inch tablets */}
                    <div className="w-full xl:w-[28%] flex flex-col gap-4 bg-[#101010] border border-white/5 rounded-2xl p-4 sm:p-6 overflow-hidden max-h-[85vh] overflow-y-auto custom-scrollbar shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">Layer Editor</span>
                            <button onClick={() => setShowHistory(true)} className="xl:hidden text-white/50 hover:text-white p-2">
                                <FileText size={16} />
                            </button>
                        </div>

                        <input 
                            type="text" 
                            dir="auto"
                            value={cvName}
                            onChange={(e) => setCvName(e.target.value)}
                            className="bg-black border border-white/10 rounded-xl px-4 py-3 text-[#E1E0CC] text-sm font-bold uppercase tracking-wide focus:border-white/30 outline-none w-full mb-4"
                            placeholder="CV Document Name"
                        />

                        {/* AI MAGIC PANEL */}
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-indigo-400" />
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">AI Auto-Generate</span>
                            </div>
                            <textarea 
                                dir="auto"
                                rows={2}
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="E.g. I'm a Senior React Developer. Skilled in Node.js. Hobbies: Photography."
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-indigo-500/50 outline-none resize-none mb-2"
                            />
                            <button 
                                onClick={handleAIGenerate}
                                disabled={isGenerating}
                                className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 disabled:opacity-50 text-[9px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isGenerating ? 'Generating Magic...' : 'Generate CV'}
                            </button>
                        </div>

                        {/* Page Switcher */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            {pages.map((p, idx) => (
                                <button 
                                    key={p.id}
                                    onClick={() => setActivePageIndex(idx)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors ${activePageIndex === idx ? 'bg-primary text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                >
                                    Page {idx + 1}
                                </button>
                            ))}
                            <button onClick={addPage} className="p-1.5 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center justify-center" title="Add Page"><Plus size={14} /></button>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Editing Page {activePageIndex + 1}</span>
                            {pages.length > 1 && (
                                <button onClick={() => removePage(activePageIndex)} className="text-[9px] text-red-500 hover:text-red-400 uppercase font-bold flex items-center gap-1"><Trash2 size={10} /> Delete Page</button>
                            )}
                        </div>

                        {/* Active Layers List */}
                        <div className="space-y-4">
                            <AnimatePresence>
                                {getActiveLayers().map((layer, idx) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={layer.id} 
                                        className="bg-black border border-white/5 rounded-xl p-4 relative group"
                                    >
                                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{layer.type}</span>
                                            <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => moveLayer(idx, 'up')} disabled={idx===0} className="p-1 hover:text-primary disabled:opacity-20"><ArrowUp size={12} /></button>
                                                <button onClick={() => moveLayer(idx, 'down')} disabled={idx===getActiveLayers().length-1} className="p-1 hover:text-primary disabled:opacity-20"><ArrowDown size={12} /></button>
                                                <button onClick={() => removeLayer(layer.id)} className="p-1 hover:text-red-500 ml-2"><Trash2 size={12} /></button>
                                            </div>
                                        </div>

                                        {/* Inputs based on type. Using dir="auto" for automatic RTL support */}
                                        <div className="space-y-2">
                                            {layer.type === 'header' && (
                                                <>
                                                    <input dir="auto" placeholder="Name" className="w-full bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-white/20 text-white" value={layer.data.name} onChange={e=>updateLayer(layer.id, 'name', e.target.value)} />
                                                    <input dir="auto" placeholder="Title" className="w-full bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-white/20 text-white" value={layer.data.title} onChange={e=>updateLayer(layer.id, 'title', e.target.value)} />
                                                    <div className="flex gap-2">
                                                        <input dir="auto" placeholder="Email" className="w-1/2 bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-white/20 text-white" value={layer.data.email} onChange={e=>updateLayer(layer.id, 'email', e.target.value)} />
                                                        <input dir="auto" placeholder="Phone" className="w-1/2 bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-white/20 text-white" value={layer.data.phone} onChange={e=>updateLayer(layer.id, 'phone', e.target.value)} />
                                                    </div>
                                                </>
                                            )}
                                            {layer.type === 'about' && (
                                                <textarea dir="auto" rows={3} placeholder="About Text" className="w-full bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-white/20 text-white resize-none" value={layer.data.text} onChange={e=>updateLayer(layer.id, 'text', e.target.value)} />
                                            )}
                                            {layer.type === 'skills' && (
                                                <>
                                                    <input dir="auto" placeholder="Category (e.g. Technical)" className="w-full bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-white/20 text-white" value={layer.data.category} onChange={e=>updateLayer(layer.id, 'category', e.target.value)} />
                                                    <input dir="auto" placeholder="Skills (comma separated)" className="w-full bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-white/20 text-white" value={layer.data.items} onChange={e=>updateLayer(layer.id, 'items', e.target.value)} />
                                                </>
                                            )}
                                            {layer.type === 'experience' && (
                                                <>
                                                    <input dir="auto" placeholder="Role / Feature Title" className="w-full bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-white/20 text-white" value={layer.data.role} onChange={e=>updateLayer(layer.id, 'role', e.target.value)} />
                                                    <div className="flex gap-2">
                                                        <input dir="auto" placeholder="Company / Entity" className="w-1/2 bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-white/20 text-white" value={layer.data.company} onChange={e=>updateLayer(layer.id, 'company', e.target.value)} />
                                                        <input dir="auto" placeholder="Period" className="w-1/2 bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-white/20 text-white" value={layer.data.period} onChange={e=>updateLayer(layer.id, 'period', e.target.value)} />
                                                    </div>
                                                    <textarea dir="auto" rows={3} placeholder="Description" className="w-full bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-white/20 text-white resize-none" value={layer.data.desc} onChange={e=>updateLayer(layer.id, 'desc', e.target.value)} />
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Add Layer Buttons */}
                        <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                            <button onClick={()=>addLayer('header')} className="text-[9px] uppercase font-bold text-gray-400 hover:text-white bg-white/5 p-2 rounded flex items-center justify-center gap-1"><Plus size={10}/> Header</button>
                            <button onClick={()=>addLayer('about')} className="text-[9px] uppercase font-bold text-gray-400 hover:text-white bg-white/5 p-2 rounded flex items-center justify-center gap-1"><Plus size={10}/> About</button>
                            <button onClick={()=>addLayer('experience')} className="text-[9px] uppercase font-bold text-gray-400 hover:text-white bg-white/5 p-2 rounded flex items-center justify-center gap-1"><Plus size={10}/> Exp / Feature</button>
                            <button onClick={()=>addLayer('skills')} className="text-[9px] uppercase font-bold text-gray-400 hover:text-white bg-white/5 p-2 rounded flex items-center justify-center gap-1"><Plus size={10}/> Skills</button>
                        </div>
                    </div>

                    {/* MIDDLE: PDF PREVIEW (col-7 xl) */}
                    <div className="w-full xl:w-[54%] flex flex-col gap-4">
                        <div className="flex items-center justify-between bg-[#101010] border border-white/5 rounded-2xl p-4 shrink-0">
                            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:block">Live Output</span>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button 
                                    onClick={handleSave} 
                                    disabled={isSaving}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 text-[9px] uppercase font-bold tracking-widest rounded-lg transition-colors"
                                >
                                    <Save size={12} /> {isSaving ? 'Saving...' : 'Save Cloud'}
                                </button>
                                <button 
                                    onClick={handleExportPDF} 
                                    disabled={isExporting}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#E1E0CC] text-black hover:bg-white px-6 py-2 text-[9px] uppercase font-bold tracking-widest rounded-lg transition-colors"
                                >
                                    <Printer size={12} /> {isExporting ? 'Processing...' : 'Download PDF'}
                                </button>
                            </div>
                        </div>

                        {/* Preview Area scaled beautifully for tablets and desktops */}
                        <div className="flex-1 overflow-auto bg-[#0a0a0a] rounded-2xl border border-white/5 p-4 sm:p-8 flex flex-col items-center custom-scrollbar gap-8">
                            
                            {/* A4 Size Containers mapped by pages */}
                            {pages.map((p, pIdx) => (
                                <div key={p.id} className="relative w-full max-w-[210mm] aspect-[1/1.414] bg-white text-black shadow-2xl shrink-0 p-[5%] font-sans flex flex-col overflow-hidden" style={{ minHeight: '800px' }}>
                                    <div className="absolute top-2 right-4 text-[10px] font-bold text-gray-300">PAGE {pIdx + 1}</div>
                                    <div className="w-full h-full text-black flex-1" style={{ fontFamily: "'Almarai', sans-serif" }}>
                                        {p.layers.map((layer, idx) => (
                                            <div key={layer.id} className={`${idx !== 0 ? 'mt-6' : ''}`}>
                                                {layer.type === 'header' && (
                                                    <div className="mb-8 border-b-2 border-black pb-4" dir="auto">
                                                        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter mb-1" style={{ fontFamily: "'Almarai', sans-serif" }}>{layer.data.name || 'YOUR NAME'}</h1>
                                                        <p className="text-base sm:text-lg text-gray-600 font-medium tracking-widest uppercase mb-3">{layer.data.title || 'PROFESSIONAL TITLE'}</p>
                                                        <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 uppercase">
                                                            {layer.data.email && <span>{layer.data.email}</span>}
                                                            {layer.data.phone && <span>{layer.data.phone}</span>}
                                                        </div>
                                                    </div>
                                                )}

                                                {layer.type === 'about' && (
                                                    <div className="mb-6" dir="auto">
                                                        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-2 text-black">Profile Summary</h2>
                                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{layer.data.text}</p>
                                                    </div>
                                                )}

                                                {layer.type === 'experience' && (
                                                    <div className="mb-4" dir="auto">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-1">
                                                            <h3 className="text-sm sm:text-base font-bold uppercase">{layer.data.role}</h3>
                                                            <span className="text-[10px] sm:text-xs font-bold text-gray-500">{layer.data.period}</span>
                                                        </div>
                                                        <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-widest mb-2">{layer.data.company}</p>
                                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{layer.data.desc}</p>
                                                    </div>
                                                )}

                                                {layer.type === 'skills' && (
                                                    <div className="mb-4" dir="auto">
                                                        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-2 text-black">{layer.data.category || 'Skills'}</h2>
                                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                                                            {layer.data.items?.split(',').map((skill, i) => (
                                                                <React.Fragment key={i}>
                                                                    {i > 0 && <span className="mx-2 text-gray-400">|</span>}
                                                                    {skill.trim()}
                                                                </React.Fragment>
                                                            ))}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: HISTORY SIDEBAR (col-2 xl) */}
                    <div className={`fixed inset-y-0 right-0 z-40 w-64 bg-[#101010] border-l border-white/5 pt-28 pb-6 px-6 xl:p-6 transform transition-transform duration-300 xl:relative xl:translate-x-0 xl:w-[18%] shrink-0 flex flex-col ${showHistory ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">History</span>
                            <button onClick={() => setShowHistory(false)} className="xl:hidden p-1 text-white hover:text-primary"><X size={16} /></button>
                        </div>

                        <button 
                            onClick={createNewCV}
                            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-xl text-[9px] uppercase font-bold tracking-widest transition-colors mb-6 shrink-0"
                        >
                            <Plus size={12} /> New CV
                        </button>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                            {history.map(cv => (
                                <div 
                                    key={cv.id} 
                                    onClick={() => loadCV(cv)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-colors group relative ${selectedId === cv.id ? 'bg-white/10 border-white/20' : 'bg-black border-white/5 hover:border-white/20'}`}
                                >
                                    <p className="text-xs font-bold text-[#E1E0CC] truncate mb-1 pr-6" dir="auto">{cv.cv_name}</p>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">{new Date(cv.updated_at).toLocaleDateString()}</p>
                                    
                                    <button 
                                        onClick={(e) => deleteCV(e, cv.id)}
                                        className="absolute right-2 top-2 p-1 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            {history.length === 0 && (
                                <p className="text-xs text-gray-500 text-center mt-10 font-bold uppercase tracking-widest">No saved CVs</p>
                            )}
                        </div>
                    </div>

                    {/* Mobile overlay */}
                    {showHistory && (
                        <div className="fixed inset-0 bg-black/60 z-30 xl:hidden backdrop-blur-sm no-print" onClick={() => setShowHistory(false)} />
                    )}

                </div>
            </section>

            {/* Hidden Export Container - Uses inline styles to prevent Tailwind CSS rendering artifacts in dom-to-image */}
            <div className="fixed top-0 left-0 z-[-100] opacity-0 pointer-events-none overflow-hidden" style={{ width: '1px', height: '1px' }}>
                <style dangerouslySetInnerHTML={{__html: `
                    #cv-export-area * {
                        border: none;
                        box-shadow: none;
                        background-color: transparent;
                    }
                `}} />
                <div id="cv-export-area" style={{ fontFamily: "'Almarai', sans-serif" }}>
                    {pages.map((p, pIdx) => (
                        <div id={`export-page-${pIdx}`} key={p.id} style={{ width: '210mm', height: '297mm', padding: '20mm', boxSizing: 'border-box', background: 'white', color: 'black', position: 'relative' }}>
                            {p.layers.map((layer, idx) => (
                                <div key={layer.id} style={{ marginTop: idx !== 0 ? '24px' : '0' }}>
                                    {layer.type === 'header' && (
                                        <div style={{ marginBottom: '32px', borderBottom: '2px solid black', paddingBottom: '16px' }} dir="auto">
                                            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>{layer.data.name || 'YOUR NAME'}</h1>
                                            <p style={{ fontSize: '18px', color: '#4b5563', fontWeight: '500', marginBottom: '12px' }}>{layer.data.title || 'PROFESSIONAL TITLE'}</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>
                                                {layer.data.email && <span>{layer.data.email}</span>}
                                                {layer.data.phone && <span>{layer.data.phone}</span>}
                                            </div>
                                        </div>
                                    )}
                                    {layer.type === 'about' && (
                                        <div style={{ marginBottom: '24px' }} dir="auto">
                                            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'black' }}>Profile Summary</h2>
                                            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>{layer.data.text}</p>
                                        </div>
                                    )}
                                    {layer.type === 'experience' && (
                                        <div style={{ marginBottom: '16px' }} dir="auto">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'black' }}>{layer.data.role}</h3>
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>{layer.data.period}</span>
                                            </div>
                                            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#4b5563', marginBottom: '8px' }}>{layer.data.company}</p>
                                            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>{layer.data.desc}</p>
                                        </div>
                                    )}
                                    {layer.type === 'skills' && (
                                        <div style={{ marginBottom: '16px' }} dir="auto">
                                            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'black' }}>{layer.data.category || 'Skills'}</h2>
                                            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', fontWeight: '500' }}>
                                                {layer.data.items?.split(',').map((skill, i) => (
                                                    <span key={i}>
                                                        {i > 0 && <span style={{ margin: '0 8px', color: '#9ca3af' }}>|</span>}
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default CVCustomize;
