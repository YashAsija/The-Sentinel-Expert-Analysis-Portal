import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { AnalysisResult } from '../hooks/useReportGenerator';

interface AuditTrailProps {
  audit: AnalysisResult['neutralityAudit'];
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrail = ({ audit, isOpen, onClose }: AuditTrailProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--bg-primary)] border-l border-[var(--border-primary)] shadow-2xl z-50 p-8 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">Neutrality Audit</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-xs font-mono text-[var(--text-secondary)] hover:text-accent transition-colors uppercase tracking-widest font-bold"
              >
                Close
              </button>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-10 leading-relaxed font-medium">
              The Sentinel automatically identifies and neutralizes prescriptive language to ensure legal and professional compliance.
            </p>

            <div className="space-y-8">
              {audit.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl bg-[var(--glass-bg)] border-2 border-[var(--border-primary)] hover:border-accent/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-1 shrink-0" />
                    <div>
                      <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase tracking-widest block mb-2 font-bold">Original Intent</span>
                      <p className="text-base text-[var(--text-secondary)] italic font-medium">"{item.original}"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 my-4 px-2">
                    <div className="h-px flex-1 bg-[var(--border-primary)]" />
                    <ChevronRight className="w-4 h-4 text-zinc-700" />
                    <div className="h-px flex-1 bg-[var(--border-primary)]" />
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-1 shrink-0" />
                    <div>
                      <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase tracking-widest block mb-2 font-bold">Neutralized Output</span>
                      <p className="text-base text-[var(--text-primary)] font-bold">"{item.neutralized}"</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
                    <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase tracking-widest block mb-2 font-bold">Logic Basis</span>
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">{item.reason}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
