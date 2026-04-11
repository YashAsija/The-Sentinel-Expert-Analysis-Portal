import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, Save, Trash2, Plus, X, Check, FileText, Settings2 } from 'lucide-react';
import { useTemplates, Template } from '../hooks/useTemplates';
import { cn } from '../lib/utils';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentInput: string;
  currentSafety: number;
  currentAccent: string;
  onLoadTemplate: (template: Template) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ 
  isOpen, 
  onClose, 
  currentInput, 
  currentSafety, 
  currentAccent,
  onLoadTemplate 
}) => {
  const { templates, saveTemplate, deleteTemplate, loading } = useTemplates();
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await saveTemplate({
        name: newName,
        description: newDesc,
        inputStructure: currentInput,
        safetyLevel: currentSafety,
        accentColor: currentAccent
      });
      setNewName('');
      setNewDesc('');
      setIsSaving(false);
    } catch (err) {
      console.error("Failed to save template:", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-container w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Layout className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-display font-bold uppercase tracking-widest">Analysis Templates</h3>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Save Current as Template */}
              <div className="space-y-4">
                <button 
                  onClick={() => setIsSaving(!isSaving)}
                  className="flex items-center gap-3 text-xs font-mono text-accent hover:text-white transition-colors font-bold uppercase tracking-widest"
                >
                  {isSaving ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isSaving ? "CANCEL" : "SAVE CURRENT CONFIG AS TEMPLATE"}
                </button>

                <AnimatePresence>
                  {isSaving && (
                    <motion.form 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleSave}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold ml-1">Template Name</label>
                          <input
                            type="text"
                            required
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-xl px-4 py-2 text-sm font-mono focus:border-accent outline-none"
                            placeholder="e.g., Medical Intake"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold ml-1">Description</label>
                          <input
                            type="text"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-xl px-4 py-2 text-sm font-mono focus:border-accent outline-none"
                            placeholder="Brief purpose..."
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-accent text-black py-3 rounded-xl font-mono text-xs font-bold tracking-widest uppercase hover:bg-white transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        CONFIRM SAVE
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Template List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold ml-1">Saved Templates</h4>
                {loading ? (
                  <div className="text-center py-12 text-zinc-600 font-mono text-xs animate-pulse">SCANNING DATABASE...</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600 font-mono text-xs">
                    NO TEMPLATES FOUND
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {templates.map((tpl) => (
                      <div 
                        key={tpl.id}
                        className="group glass-container p-6 flex items-center justify-between hover:border-accent/50 transition-all"
                      >
                        <div className="space-y-1">
                          <h5 className="text-lg font-display font-bold text-white group-hover:text-accent transition-colors">{tpl.name}</h5>
                          <p className="text-xs text-zinc-500 font-medium">{tpl.description || 'No description provided'}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                              <Settings2 className="w-3 h-3" />
                              LEVEL: {tpl.safetyLevel}%
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                              <FileText className="w-3 h-3" />
                              STRUCTURED
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              onLoadTemplate(tpl);
                              onClose();
                            }}
                            className="bg-zinc-800 hover:bg-accent hover:text-black text-zinc-300 px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all"
                          >
                            LOAD
                          </button>
                          <button
                            onClick={() => deleteTemplate(tpl.id)}
                            className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
