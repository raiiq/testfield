/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { projects as localProjects } from '../data/projects';
import { experience as localExperience, skills as localSkills } from '../data/resume';
import { settings as localSettings } from '../data/settings';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [experience, setExperience] = useState([]);
    const [skills, setSkills] = useState([]);
    const [settings, setSettings] = useState(localSettings);
    const [loading, setLoading] = useState(false);

    const fetchProjects = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('projects').select('*').order('sort_order', { ascending: true });

            console.log('Fetching projects from Supabase...');
            console.log('Supabase data:', data);
            console.log('Supabase error:', error);

            if (error) {
                console.error('Error fetching projects:', error);
                // Only use local demo projects as fallback
                const formattedLocal = localProjects.map((p, i) => ({ ...p, id: `demo-${p.id}`, sort_order: i }));
                setProjects(formattedLocal);
            } else {
                const supabaseData = data || [];

                // If we have Supabase data, prioritize it
                if (supabaseData.length > 0) {
                    console.log(`Loaded ${supabaseData.length} projects from Supabase`);
                    setProjects(supabaseData.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
                } else {
                    // Only show demo projects if database is empty
                    console.log('No Supabase projects, using demo data');
                    const formattedLocal = localProjects.map((p, i) => ({ ...p, id: `demo-${p.id}`, sort_order: i }));
                    setProjects(formattedLocal);
                }
            }
        } catch (err) {
            console.error('Unexpected error in fetchProjects:', err);
            const formattedLocal = localProjects.map((p, i) => ({ ...p, id: `demo-${p.id}`, sort_order: i }));
            setProjects(formattedLocal);
        }
    }, []);

    const reorderProject = async (id, newOrder) => {
        if (isNaN(newOrder)) {
            console.error('Invalid order value: NaN');
            return;
        }

        const isLocal = String(id).includes('demo') || String(id).includes('local');

        setLoading(true);
        try {
            // Only update Supabase if it's a real database project
            if (!isLocal) {
                const { error } = await supabase
                    .from('projects')
                    .update({ sort_order: newOrder })
                    .eq('id', id);

                if (error) throw error;
                console.log('Reorder successful in Supabase');
                await fetchProjects();
            } else {
                console.log('Local reorder (not in DB yet)');
                // Just update local state for demo projects
                setProjects(prev => {
                    const updated = prev.map(p => p.id === id ? { ...p, sort_order: newOrder } : p);
                    return updated.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                });
            }
        } catch (error) {
            console.error('Error reordering project:', error);
            // Non-critical error, just log it
            setProjects(prev => {
                const updated = prev.map(p => p.id === id ? { ...p, sort_order: newOrder } : p);
                return updated.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchExperience = useCallback(async () => {
        const { data, error } = await supabase.from('experience').select('*').order('sort_order', { ascending: true });

        const formattedLocal = localExperience.map((job, index) => ({
            ...job,
            id: `local-${job.id || index}`,
            sort_order: job.sort_order || index
        }));

        if (error) {
            console.error('Error fetching experience:', error);
            setExperience(formattedLocal.sort((a, b) => a.sort_order - b.sort_order));
        } else {
            const supabaseData = data || [];
            if (supabaseData.length > 0) {
                setExperience(supabaseData);
            } else {
                setExperience(formattedLocal);
            }
        }
    }, []);

    const reorderExperience = (id, newOrder) => {
        setExperience(prev => {
            const updated = prev.map(e => e.id === id ? { ...e, sort_order: newOrder } : e);
            return [...updated].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        });
    };

    const saveExperienceOrder = async () => {
        setLoading(true);
        try {
            // Map entire current state to sequential orders and sync
            const updates = experience.map((job, index) => {
                const { id, ...data } = job;
                const isLocal = String(id).includes('local');
                return {
                    ...(isLocal ? {} : { id }),
                    ...data,
                    sort_order: index
                };
            });

            // Upsert handles both new (local) and existing (DB) records
            const { error } = await supabase.from('experience').upsert(updates);
            if (error) throw error;

            await fetchExperience();
            console.log('Experience sequence synchronized');
        } catch (err) {
            console.error('Failed to save experience order:', err);
            alert(`Save failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchSkills = useCallback(async () => {
        const { data, error } = await supabase.from('skills').select('*').order('sort_order', { ascending: true });

        const formattedLocalSkills = Object.entries(localSkills).map(([category, items], index) => ({
            id: `local-${index}`,
            category,
            items,
            sort_order: index
        }));

        if (error) {
            console.error('Error fetching skills:', error);
            setSkills(formattedLocalSkills);
        } else {
            setSkills(data && data.length > 0 ? data : formattedLocalSkills);
        }
    }, []);

    const reorderSkill = (id, newOrder) => {
        setSkills(prev => {
            const updated = prev.map(s => s.id === id ? { ...s, sort_order: newOrder } : s);
            return [...updated].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        });
    };

    const saveSkillsOrder = async () => {
        setLoading(true);
        try {
            const updates = skills.map((group, index) => {
                const { id, ...data } = group;
                const isLocal = String(id).includes('local');
                return {
                    ...(isLocal ? {} : { id }),
                    ...data,
                    sort_order: index
                };
            });

            const { error } = await supabase.from('skills').upsert(updates);
            if (error) throw error;

            await fetchSkills();
            console.log('Skills sequence synchronized');
        } catch (err) {
            console.error('Failed to save skills order:', err);
            alert(`Save failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('site_settings').select('*').maybeSingle();
            if (error) throw error;
            if (data) setSettings(data);
            else setSettings(localSettings);
        } catch (error) {
            console.log('Using local site settings (Supabase table not found or empty)');
            setSettings(localSettings);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProjects();
        fetchExperience();
        fetchSkills();
        fetchSettings();

        // Optional: Real-time subscriptions could be added here
    }, [fetchProjects, fetchExperience, fetchSkills, fetchSettings]);

    const addProject = async (newProject) => {
        // Optimistic update - add to UI immediately
        const tempId = `temp-${Date.now()}`;
        const optimisticProject = { ...newProject, id: tempId };
        setProjects(prev => [...prev, optimisticProject]);

        setLoading(true);
        try {
            // Remove aspectRatio and id fields to let Supabase auto-generate the ID
            const { aspectRatio, id, ...projectData } = newProject;
            console.log('Inserting project to Supabase:', projectData);

            const { data, error } = await supabase.from('projects').insert([projectData]).select();

            if (error) throw error;

            console.log('Project added successfully:', data);

            // Replace temp project with real one from database
            if (data && data[0]) {
                setProjects(prev => prev.map(p => p.id === tempId ? data[0] : p));
            }
        } catch (error) {
            // Handle missing column error gracefully
            if (error.message && (error.message.includes('column "release_date" of relation "projects" does not exist') || error.message.includes("Could not find the 'release_date' column"))) {
                console.warn('Release date column missing in DB. Retrying without it.');
                try {
                    const { aspectRatio, id, release_date, ...safeProjectData } = newProject;
                    const { data, error: retryError } = await supabase.from('projects').insert([safeProjectData]).select();
                    if (retryError) throw retryError;

                    console.log('Project added without release_date:', data);
                    if (data && data[0]) {
                        setProjects(prev => prev.map(p => p.id === tempId ? { ...data[0], release_date: newProject.release_date } : p));
                    }
                    alert('Project saved! Note: Release Date was NOT saved to the database (column missing). Please add "release_date" column to Supabase.');
                    return;
                } catch (retryErr) {
                    console.error('Retry failed:', retryErr);
                }
            }

            console.error('Error adding project:', error);
            alert(`Failed to add project: ${error.message}`);
            // Revert optimistic update on error
            setProjects(prev => prev.filter(p => p.id !== tempId));
        } finally {
            setLoading(false);
        }
    };

    const updateProject = async (id, updatedProject) => {
        // Optimistic update - show changes immediately
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedProject } : p));

        setLoading(true);
        try {
            const { aspectRatio: _, ...cleanProject } = updatedProject;
            const isLocal = String(id).includes('demo') || String(id).includes('local');
            let dataToSync;

            if (isLocal) {
                const { id: _, ...rest } = cleanProject;
                dataToSync = rest;
            } else {
                dataToSync = { ...cleanProject, id };
            }

            const { data, error } = await supabase.from('projects').upsert(dataToSync).select();
            if (error) throw error;

            console.log('Project updated successfully:', data);

            // Update with server response
            if (data && data[0]) {
                setProjects(prev => prev.map(p => p.id === id ? data[0] : p));
            }
        } catch (error) {
            // Handle missing column error gracefully
            if (error.message && (error.message.includes('column "release_date" of relation "projects" does not exist') || error.message.includes("Could not find the 'release_date' column"))) {
                console.warn('Release date column missing in DB. Retrying without it.');
                try {
                    const { aspectRatio: _, ...cleanProject } = updatedProject;
                    const { release_date, ...safeProjectData } = cleanProject;
                    const dataToSync = { ...safeProjectData, id }; // Ensure ID is present for upsert

                    const { data, error: retryError } = await supabase.from('projects').upsert(dataToSync).select();
                    if (retryError) throw retryError;

                    console.log('Project updated without release_date:', data);
                    // Keep the local state with the date so UI looks correct until refresh
                    alert('Project saved! Note: Release Date was NOT saved to the database (column missing). Please add "release_date" column to Supabase.');
                    return;
                } catch (retryErr) {
                    console.error('Retry failed:', retryErr);
                }
            }

            console.error('Error updating project:', error);
            alert(`Update failed: ${error.message}`);
            // Revert to previous state by re-fetching
            await fetchProjects();
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (id) => {
        // Optimistic update - remove from UI immediately
        const previousProjects = projects;
        setProjects(prev => prev.filter(p => p.id !== id));

        setLoading(true);
        try {
            const isLocal = String(id).includes('demo') || String(id).includes('local');
            if (!isLocal) {
                const { error } = await supabase.from('projects').delete().eq('id', id);
                if (error) throw error;
            }
            console.log('Project deleted successfully');
        } catch (error) {
            console.error('Error deleting project:', error);
            alert(`Delete failed: ${error.message}`);
            // Revert optimistic update on error
            setProjects(previousProjects);
        } finally {
            setLoading(false);
        }
    };

    // Experience CRUD
    const addExperience = async (newJob) => {
        setLoading(true);
        try {
            // Remove id field to let Supabase auto-generate it
            const { id, ...jobData } = newJob;
            console.log('Inserting experience to Supabase:', jobData);

            const { data, error } = await supabase.from('experience').insert([jobData]).select();

            if (error) throw error;

            console.log('Experience added successfully:', data);
            await fetchExperience();
        } catch (error) {
            console.error('Error adding experience:', error);
            alert(`Failed to add experience: ${error.message}`);
            setExperience(prev => [...prev, { ...newJob, id: Date.now() }]);
        } finally {
            setLoading(false);
        }
    };

    const updateExperience = async (id, updatedJob) => {
        // Optimistic update
        setExperience(prev => prev.map(job => job.id === id ? { ...job, ...updatedJob } : job));

        console.log('Upserting experience:', updatedJob);
        try {
            const isLocal = String(id).includes('local');
            let dataToSync;

            if (isLocal) {
                // Remove local ID so Supabase creates a new one
                const { id: _, ...rest } = updatedJob;
                dataToSync = rest;
            } else {
                dataToSync = updatedJob;
            }

            const { data, error } = await supabase.from('experience').upsert(dataToSync).select();
            if (error) throw error;

            console.log('Experience synced successfully:', data);

            // If it was local, it now has a real DB ID, so refresh to get it
            if (isLocal || (data && data[0])) {
                await fetchExperience();
            }
        } catch (error) {
            console.error('Error syncing experience:', error);
            alert(`Sync failed: ${error.message}`);
            await fetchExperience(); // Revert to server state
        }
    };

    const deleteExperience = async (id) => {
        // Optimistic update
        const previousExperience = experience;
        setExperience(prev => prev.filter(job => job.id !== id));

        setLoading(true);
        try {
            const isLocal = String(id).includes('local');
            if (!isLocal) {
                const { error } = await supabase.from('experience').delete().eq('id', id);
                if (error) throw error;
            } else {
                console.log('Skipping Supabase delete for local experience');
            }
            console.log('Experience deleted successfully');
        } catch (error) {
            console.error('Error deleting experience:', error);
            alert(`Delete failed: ${error.message}`);
            // Revert optimistic update
            setExperience(previousExperience);
        } finally {
            setLoading(false);
        }
    };

    // Skills CRUD
    const addSkill = async (newSkillGroup) => {
        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticSkill = { ...newSkillGroup, id: tempId };
        setSkills(prev => [...prev, optimisticSkill]);

        setLoading(true);
        try {
            const { id, ...skillData } = newSkillGroup;
            const { data, error } = await supabase.from('skills').insert([skillData]).select();

            if (error) throw error;

            console.log('Skill category added successfully:', data);

            if (data && data[0]) {
                setSkills(prev => prev.map(s => s.id === tempId ? data[0] : s));
            }
        } catch (error) {
            console.error('Error adding skill:', error);
            alert(`Failed to add skill category: ${error.message}`);
            setSkills(prev => prev.filter(s => s.id !== tempId));
        } finally {
            setLoading(false);
        }
    };

    const updateSkills = async (id, updatedSkillGroup) => {
        // Optimistic update
        setSkills(prev => prev.map(group => group.id === id ? { ...group, ...updatedSkillGroup } : group));

        console.log('Upserting skills:', updatedSkillGroup);
        try {
            const isLocal = String(id).includes('local');
            let dataToSync;

            if (isLocal) {
                // Remove local ID so Supabase creates a new one
                const { id: _, ...rest } = updatedSkillGroup;
                dataToSync = rest;
            } else {
                dataToSync = updatedSkillGroup;
            }

            const { data, error } = await supabase.from('skills').upsert(dataToSync).select();
            if (error) throw error;

            console.log('Skill synced successfully:', data);

            // If it was local, it now has a real DB ID, so refresh to get it
            if (isLocal || (data && data[0])) {
                await fetchSkills();
            }
        } catch (error) {
            console.error('Error syncing skills:', error);
            alert(`Sync failed: ${error.message}`);
            await fetchSkills(); // Revert to server state
        }
    };

    const deleteSkill = async (id) => {
        // Optimistic update
        const previousSkills = skills;
        const remainingSkills = skills.filter(s => s.id !== id);
        setSkills(remainingSkills);

        setLoading(true);
        try {
            const isLocal = String(id).includes('local');
            if (!isLocal) {
                const { error } = await supabase.from('skills').delete().eq('id', id);
                if (error) throw error;
            } else {
                console.log('Handling local skill deletion');
                // If we delete a local skill, we need to make sure the others are in the DB
                // so the demo fallback doesn't trigger on refresh
                const { data: dbData } = await supabase.from('skills').select('id').limit(1);
                if (!dbData || dbData.length === 0) {
                    console.log('DB empty, syncing remaining local skills to persist deletion');
                    const toSync = remainingSkills.map(({ id: _, ...rest }) => rest);
                    if (toSync.length > 0) {
                        const { error: syncError } = await supabase.from('skills').insert(toSync);
                        if (syncError) throw syncError;
                    } else {
                        // If everything is deleted, maybe insert a dummy or just accept it might come back
                        // for now we'll just log
                        console.log('No skills remaining to sync');
                    }
                }
            }

            console.log('Skill category deleted successfully');
        } catch (error) {
            console.error('Error deleting skill:', error);
            alert(`Delete failed: ${error.message}`);
            setSkills(previousSkills);
        } finally {
            setLoading(false);
        }
    };

    // Settings CRUD
    const updateSettings = async (newSettings) => {
        setLoading(true);
        try {
            const { error } = await supabase.from('site_settings').upsert({ id: settings.id || 1, ...newSettings });
            if (error) throw error;
            setSettings(prev => ({ ...prev, ...newSettings }));
        } catch (error) {
            console.error('Error updating settings:', error);
            setSettings(prev => ({ ...prev, ...newSettings }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DataContext.Provider value={{
            projects, addProject, updateProject, deleteProject, reorderProject,
            experience, addExperience, updateExperience, deleteExperience, reorderExperience, saveExperienceOrder,
            skills, addSkill, updateSkills, deleteSkill, reorderSkill, saveSkillsOrder,
            settings, updateSettings,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};
