import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { History, FileText } from 'lucide-react';
import { AnalysisResult } from '../hooks/useReportGenerator';
import { cn } from '../lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface ReportViewProps {
  data: AnalysisResult;
  safetyLevel: number; // 0 to 100
  onOpenAudit?: () => void;
  onConvertToLegal?: () => void;
}

export const ReportView = ({ data, safetyLevel, onOpenAudit, onConvertToLegal }: ReportViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  const isDeep = safetyLevel > 50;

  useEffect(() => {
    if (!containerRef.current) return;
    
    gsap.to(containerRef.current, {
      paddingTop: isDeep ? "4rem" : "2rem",
      gap: isDeep ? "4rem" : "2rem",
      duration: 0.8,
      ease: "expo.out"
    });

    sectionsRef.current.forEach((section) => {
      if (!section) return;
      gsap.to(section, {
        borderLeftWidth: isDeep ? "4px" : "1px",
        borderColor: isDeep ? "var(--color-accent)" : "var(--border-primary)",
        paddingLeft: isDeep ? "2rem" : "1.5rem",
        duration: 0.8,
        ease: "expo.out"
      });
    });
  }, [isDeep]);

  const sections = [
    { 
      title: "Observed Trends", 
      content: isDeep ? data.detailed.observedTrends : data.brief.observedTrends 
    },
    { 
      title: "Regulatory Context", 
      content: isDeep ? data.detailed.regulatoryContext : data.brief.regulatoryContext 
    },
    { 
      title: "Literature Benchmarks", 
      content: isDeep ? data.detailed.literatureBenchmarks : data.brief.literatureBenchmarks 
    },
  ];

  return (
    <div ref={containerRef} className="flex flex-col max-w-4xl mx-auto pb-24">
      {/* Mandatory Disclaimer */}
      <div className="mb-12 p-8 bg-red-500/5 border-2 border-red-500/20 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-4 mb-3">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          <h4 className="text-sm font-mono text-red-400 uppercase tracking-[0.2em] font-bold">Mandatory Disclaimer</h4>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic font-medium">
          The AI-generated content provided in this report is for informational purposes only and does not constitute professional, legal, or medical advice. Users are advised to consult with qualified professionals before taking any action based on this analysis.
        </p>
      </div>

      <div className="mb-16 border-b border-[var(--border-primary)] pb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-accent font-bold tracking-[0.3em] uppercase">Status: Verified</span>
            <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
          </div>
          <h2 className="text-7xl font-bold mb-4 tracking-tighter font-display">Analysis Report</h2>
          <p className="text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-[0.4em] font-bold">
            Ref ID: SENTINEL-{Math.random().toString(36).substring(7).toUpperCase()} • {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4 mb-1">
          {onConvertToLegal && (
            <button 
              onClick={onConvertToLegal}
              className="flex items-center gap-2 text-xs font-mono text-accent hover:text-white transition-all font-bold uppercase tracking-widest border border-accent/30 px-4 py-2 rounded-lg hover:bg-accent hover:border-accent glass-container"
            >
              <FileText className="w-4 h-4" />
              CONVERT TO LEGAL
            </button>
          )}
          {onOpenAudit && (
            <button 
              onClick={onOpenAudit}
              className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-accent transition-all font-bold uppercase tracking-widest border border-[var(--border-primary)] px-4 py-2 rounded-lg hover:border-accent/50 glass-container"
            >
              <History className="w-4 h-4" />
              AUDIT TRAIL
            </button>
          )}
        </div>
      </div>

      {sections.map((section, i) => (
        <div 
          key={i}
          ref={el => { sectionsRef.current[i] = el; }}
          className="group border-l-2 border-[var(--border-primary)] pl-8 mb-16 transition-all duration-500 hover:border-accent relative"
        >
          <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[var(--bg-primary)] border-2 border-accent rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-[11px] font-mono text-accent uppercase tracking-[0.3em] font-bold">
              [{String(i + 1).padStart(2, '0')}] {section.title}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-accent/20 to-transparent" />
          </div>
          <div className={cn(
            "text-[var(--text-primary)] leading-relaxed transition-all duration-500 font-medium",
            isDeep ? "text-2xl font-bold tracking-tight" : "text-lg"
          )}>
            {section.content}
          </div>
        </div>
      ))}

      {/* Citations Section */}
      {data.citations && data.citations.length > 0 && (
        <div className="mt-20 pt-12 border-t border-[var(--border-primary)]">
          <h3 className="text-sm font-mono text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-8 font-bold">Citations & References</h3>
          <div className="grid gap-6">
            {data.citations.map((cite, i) => (
              <div key={i} className="glass-container p-6">
                <p className="text-[var(--text-primary)] mb-3 text-sm font-medium italic">"{cite.fact}"</p>
                <p className="text-accent font-mono uppercase tracking-tighter font-bold text-xs">— {cite.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Neutrality Flags Section */}
      {data.neutralityFlags && data.neutralityFlags.length > 0 && (
        <div className="mt-20 pt-12 border-t border-[var(--border-primary)]">
          <h3 className="text-sm font-mono text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-8 font-bold">Tone & Neutrality Check</h3>
          <div className="space-y-6">
            {data.neutralityFlags.map((flag, i) => (
              <div key={i} className="p-6 bg-red-500/5 border-2 border-red-500/10 rounded-xl backdrop-blur-sm transition-all hover:bg-red-500/10">
                <p className="text-base text-[var(--text-primary)] italic mb-4 font-medium">"{flag.sentence}"</p>
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest mb-3 font-bold">
                  <span className="text-red-400">Issue:</span>
                  <span className="text-[var(--text-secondary)]">{flag.issue}</span>
                </div>
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold">
                  <span className="text-accent">Suggestion:</span>
                  <span className="text-[var(--text-primary)]">{flag.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
