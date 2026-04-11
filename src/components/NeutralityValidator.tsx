import React, { useMemo } from 'react';
import { cn } from '../lib/utils';

interface NeutralityValidatorProps {
  text: string;
  className?: string;
}

const PRESCRIPTIVE_PATTERNS = [
  { pattern: /\bshould\b/gi, replacement: 'indicated' },
  { pattern: /\bmust\b/gi, replacement: 'required by' },
  { pattern: /\brecommend\b/gi, replacement: 'suggested' },
  { pattern: /\badvise\b/gi, replacement: 'observed' },
  { pattern: /\bought to\b/gi, replacement: 'associated with' },
  { pattern: /\bit is recommended to\b/gi, replacement: 'it is indicated that' },
  { pattern: /\bconsider doing\b/gi, replacement: 'data suggests' },
  { pattern: /\bwe suggest\b/gi, replacement: 'observations include' },
  { pattern: /\byou should\b/gi, replacement: 'it was observed that' },
];

export const NeutralityValidator = ({ text, className }: NeutralityValidatorProps) => {
  const parts = useMemo(() => {
    if (!text) return [];
    
    let result: (string | React.ReactNode)[] = [text];
    
    PRESCRIPTIVE_PATTERNS.forEach(({ pattern, replacement }) => {
      const newResult: (string | React.ReactNode)[] = [];
      
      result.forEach((part) => {
        if (typeof part !== 'string') {
          newResult.push(part);
          return;
        }
        
        const splitParts = part.split(pattern);
        const matches = part.match(pattern);
        
        splitParts.forEach((splitPart, i) => {
          newResult.push(splitPart);
          if (matches && matches[i]) {
            newResult.push(
              <span key={`${pattern}-${i}`} className="group relative inline-block">
                <span className="text-red-400 font-medium underline decoration-red-400/50 underline-offset-4 cursor-help transition-colors hover:text-red-300">
                  {matches[i]}
                </span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[11px] text-[var(--text-primary)] shadow-2xl z-50">
                  <span className="block text-red-400 font-bold mb-1 uppercase tracking-wider">Prescriptive Intent</span>
                  Neutral alternative: <span className="text-accent font-medium italic">"{replacement}"</span>
                </span>
              </span>
            );
          }
        });
      });
      
      result = newResult;
    });
    
    return result;
  }, [text]);

  return (
    <div className={cn("font-mono text-sm leading-relaxed text-[var(--text-secondary)]", className)}>
      {parts}
    </div>
  );
};
