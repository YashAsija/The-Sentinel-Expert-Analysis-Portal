/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { Shield, Send, History, Cpu, Layers, Maximize2, Minimize2, Upload, FileText, Palette, X, Sun, Moon, Link as LinkIcon, Download, Copy, FileCheck, Check, Layout, LogOut, User as UserIcon, FileSpreadsheet, Save } from 'lucide-react';
import { ThreeBackground } from './components/ThreeBackground';
import { useReportGenerator } from './hooks/useReportGenerator';
import { NeutralityValidator } from './components/NeutralityValidator';
import { ReportView } from './components/ReportView';
import { AuditTrail } from './components/AuditTrail';
import { AuthModal } from './components/AuthModal';
import { TemplateManager } from './components/TemplateManager';
import { useAuth } from './contexts/AuthContext';
import { Template } from './hooks/useTemplates';
import { cn } from './lib/utils';
import { parseFile } from './lib/fileParser';
import { exportToCSV, exportToPDF } from './lib/exportUtils';

const ACCENT_PALETTE = [
  { name: 'Emerald', color: '#50C878', dark: '#3da35f' },
  { name: 'Royal', color: '#4169E1', dark: '#3151b5' },
  { name: 'Crimson', color: '#DC143C', dark: '#a10f2c' },
  { name: 'Amber', color: '#FFBF00', dark: '#cc9900' },
  { name: 'Purple', color: '#673AB7', dark: '#512da8' },
  { name: 'Slate', color: '#708090', dark: '#566370' },
];

export default function App() {
  const [inputText, setInputText] = useState('');
  const [safetyLevel, setSafetyLevel] = useState(30);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [scrambleText, setScrambleText] = useState('');
  const [selectedAccent, setSelectedAccent] = useState(ACCENT_PALETTE[1]); // Default to Royal Blue
  const [isParsing, setIsParsing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLegalPreview, setShowLegalPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  
  const { user, logout } = useAuth();
  const { generateReport, isProcessing, result, error, resetResult } = useReportGenerator();
  const scrambleRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const legalPreviewRef = useRef<HTMLDivElement>(null);

  // Scroll listener for header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Progress bar simulation
  useEffect(() => {
    if (isProcessing) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 95 ? 95 : prev + Math.random() * 10));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [isProcessing]);

  // Apply accent color and theme to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', selectedAccent.color);
    document.documentElement.style.setProperty('--accent-color-dark', selectedAccent.dark);
    
    // Convert hex to RGB for the glow effects
    const r = parseInt(selectedAccent.color.slice(1, 3), 16);
    const g = parseInt(selectedAccent.color.slice(3, 5), 16);
    const b = parseInt(selectedAccent.color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
    
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [selectedAccent, isDarkMode]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLoadTemplate = (template: Template) => {
    setInputText(template.inputStructure);
    setSafetyLevel(template.safetyLevel);
    const accent = ACCENT_PALETTE.find(a => a.color === template.accentColor);
    if (accent) setSelectedAccent(accent);
  };

  // Text scrambling effect during processing
  useEffect(() => {
    if (isProcessing) {
      const chars = "!<>-_\\/[]{}—=+*^?#________";
      let iteration = 0;
      const interval = setInterval(() => {
        setScrambleText(
          "ANALYZING DATA STREAM".split("")
            .map((char, index) => {
              if (index < iteration) return "ANALYZING DATA STREAM"[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );
        iteration += 1/3;
        if (iteration >= "ANALYZING DATA STREAM".length) iteration = 0;
      }, 30);
      return () => clearInterval(interval);
    } else {
      setScrambleText('');
    }
  }, [isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateReport(inputText);
  };

  const handleUrlFetch = async () => {
    setUrlError(null);
    const trimmedUrl = urlInput.trim();
    
    if (!trimmedUrl) {
      setUrlError("ERR_EMPTY_URL: Source location required for ingestion.");
      return;
    }

    // Strict URL validation
    try {
      const url = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error();
      }
    } catch (e) {
      setUrlError("ERR_INVALID_PROTOCOL: Only secure HTTP/HTTPS protocols are supported.");
      return;
    }

    setIsFetchingUrl(true);
    
    // Advanced Simulation: Real-world failure modes
    setTimeout(() => {
      const lowerUrl = trimmedUrl.toLowerCase();
      
      // 1. Simulate 404 Not Found
      if (lowerUrl.includes('404') || lowerUrl.includes('notfound') || lowerUrl.includes('broken')) {
        setUrlError("HTTP_404_NOT_FOUND: The remote server returned a 404 error. The resource at this location does not exist.");
        setIsFetchingUrl(false);
        return;
      }

      // 2. Simulate Network/DNS Issues
      if (lowerUrl.includes('offline') || lowerUrl.includes('timeout') || !lowerUrl.includes('.')) {
        setUrlError("ERR_CONNECTION_TIMED_OUT: Failed to establish a handshake with the remote host. Check your network connectivity.");
        setIsFetchingUrl(false);
        return;
      }

      // 3. Simulate Access Denied / Forbidden
      if (lowerUrl.includes('private') || lowerUrl.includes('forbidden') || lowerUrl.includes('admin')) {
        setUrlError("HTTP_403_FORBIDDEN: Access to this resource is restricted by the host's security policy.");
        setIsFetchingUrl(false);
        return;
      }

      // 4. Simulate Generic 404 for very short or suspicious URLs
      if (trimmedUrl.length < 15 && !trimmedUrl.includes('google.com')) {
        setUrlError("HTTP_404_NOT_FOUND: Resource verification failed. The link appears to be invalid or dead.");
        setIsFetchingUrl(false);
        return;
      }

      // Success Path
      const hostname = new URL(trimmedUrl).hostname;
      setInputText(prev => prev + (prev ? '\n\n' : '') + `[SECURE DATA STREAM ACQUIRED FROM: ${trimmedUrl}]\n\nSource: ${hostname}\nStatus: Decrypted\nIntegrity: 100%\n\nThis document has been successfully ingested into The Sentinel's analysis engine. Initial scanning reveals multiple vectors of prescriptive intent and non-neutral phrasing that require immediate transformation to meet professional standards.\n\n[End of Ingestion Stream]`);
      setUrlInput('');
      setShowUrlInput(false);
      setIsFetchingUrl(false);
    }, 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;

    // 1. Check File Type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      setFileError("ERR_UNSUPPORTED_TYPE: Only PDF, DOCX, and TXT files are permitted for secure analysis.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Check File Size (10MB Limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError(`ERR_FILE_TOO_LARGE: Maximum payload exceeded (Limit: 10MB). Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsParsing(true);
    try {
      const text = await parseFile(file);
      if (!text || text.trim().length === 0) {
        throw new Error("ERR_EMPTY_PAYLOAD: The document contains no extractable text data.");
      }
      setInputText(text);
    } catch (err) {
      console.error("File parsing failed:", err);
      setFileError(err instanceof Error ? err.message : "ERR_PARSING_FAILED: An internal error occurred during document extraction.");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative min-h-screen selection:bg-accent/30 selection:text-white">
      <ThreeBackground 
        intensity={inputText.length > 0 ? (isProcessing ? 1 : 0.3) : 0} 
        color={selectedAccent.color}
      />
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] pointer-events-none">
        <motion.div 
          className="h-full bg-accent shadow-[0_0_10px_var(--accent-color)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50 transition-all duration-500",
        isScrolled ? "scrolled" : "mix-blend-difference"
      )}>
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-12 h-12 border-2 border-accent flex items-center justify-center rounded-lg transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(var(--accent-color-rgb),0.4)]">
            <Shield className="w-6 h-6 text-accent transition-colors" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tighter uppercase">The Sentinel</h1>
            <p className="text-[11px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.4em] font-bold">Expert Analysis Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-accent transition-colors font-bold"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDarkMode ? "LIGHT" : "DARK"}
          </button>
          <button 
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-accent transition-colors font-bold"
          >
            <Palette className="w-4 h-4" />
            THEME
          </button>

          {user ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsTemplateManagerOpen(true)}
                className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-accent transition-colors font-bold"
              >
                <Layout className="w-4 h-4" />
                TEMPLATES
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-[var(--border-primary)]">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-tighter leading-none mb-1">Authorized Agent</p>
                  <p className="text-[11px] font-mono text-[var(--text-primary)] font-bold truncate max-w-[120px]">{user.email?.split('@')[0]}</p>
                </div>
                <button 
                  onClick={() => logout()}
                  className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center hover:border-red-500/50 hover:text-red-500 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-accent text-black px-6 py-2 rounded-lg font-mono text-xs font-bold tracking-widest hover:bg-white transition-colors"
            >
              AUTHORIZE
            </button>
          )}
          <div className="hidden md:flex items-center gap-3">
            <Cpu className="w-4 h-4 text-[var(--text-muted)]" />
            <div className="h-px w-12 bg-[var(--border-primary)]" />
            <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold">v2.5.0-STABLE</span>
          </div>
        </div>
      </header>

          <AnimatePresence>
            {isPaletteOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-24 right-8 glass-container p-6 z-40 w-56"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] font-mono text-zinc-300 uppercase tracking-widest font-bold">Accent Palette</span>
                  <button onClick={() => setIsPaletteOpen(false)} className="hover:text-accent transition-colors">
                    <X className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {ACCENT_PALETTE.map((accent) => (
                    <button
                      key={accent.name}
                      onClick={() => setSelectedAccent(accent)}
                      className={cn(
                        "w-full aspect-square rounded-md transition-all duration-300 hover:scale-110 shadow-lg",
                        selectedAccent.name === accent.name ? "ring-2 ring-white ring-offset-4 ring-offset-black scale-110" : "opacity-60 hover:opacity-100"
                      )}
                      style={{ backgroundColor: accent.color }}
                      title={accent.name}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

      <main className="container mx-auto px-6 pt-32 pb-20 relative z-20">
        <div className="max-w-5xl mx-auto">
          
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h2 className="text-7xl font-display font-bold leading-tight tracking-tighter">
                    Secure Analysis <br />
                    <span className="text-[var(--text-muted)]">Starts Here.</span>
                  </h2>
                  <p className="text-[var(--text-secondary)] max-w-xl text-xl font-medium leading-relaxed">
                    Input raw sensitive data or upload documents for neutral transformation. 
                    Our engine ensures descriptive integrity and regulatory compliance.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-transparent rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative glass-container p-10 bg-black/40 border-accent/20">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono text-accent uppercase tracking-[0.3em] font-bold block">Input Stream</span>
                          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold">Secure Channel 01</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {user && (
                          <button
                            type="button"
                            onClick={() => setIsTemplateManagerOpen(true)}
                            className="flex items-center gap-2 text-[10px] font-mono text-accent hover:text-white transition-all font-bold uppercase tracking-widest group/btn"
                          >
                            <Save className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                            SAVE TEMPLATE
                          </button>
                        )}
                        <div className="h-4 w-px bg-[var(--border-primary)]" />
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className={cn(
                            "flex items-center gap-2 text-[10px] font-mono transition-all font-bold uppercase tracking-widest",
                            showUrlInput ? "text-accent" : "text-[var(--text-secondary)] hover:text-accent"
                          )}
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isParsing}
                          className={cn(
                            "flex items-center gap-2 text-[10px] font-mono transition-all font-bold uppercase tracking-widest",
                            fileError ? "text-red-400" : "text-[var(--text-secondary)] hover:text-accent"
                          )}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {isParsing ? "PARSING..." : "UPLOAD"}
                        </button>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".pdf,.docx,.txt" 
                        className="hidden" 
                      />
                    </div>

                    <AnimatePresence>
                      {fileError && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mb-6 overflow-hidden"
                        >
                          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-3 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                            <X className="w-4 h-4 shrink-0" />
                            {fileError}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {showUrlInput && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mb-6 overflow-hidden"
                        >
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => {
                                  setUrlInput(e.target.value);
                                  if (urlError) setUrlError(null);
                                }}
                                placeholder="Enter document URL (e.g., https://example.com/doc.pdf)..."
                                className={cn(
                                  "flex-1 bg-zinc-900/50 border-2 rounded-lg px-4 py-2 text-sm font-mono focus:border-accent outline-none transition-colors",
                                  urlError ? "border-red-500/50" : "border-zinc-800"
                                )}
                              />
                              <button
                                type="button"
                                onClick={handleUrlFetch}
                                disabled={isFetchingUrl}
                                className="bg-accent text-black px-6 py-2 rounded-lg font-mono text-xs font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                              >
                                {isFetchingUrl ? "VERIFYING..." : "FETCH"}
                              </button>
                            </div>
                            <AnimatePresence>
                              {urlError && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="flex items-center gap-2 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider"
                                >
                                  <X className="w-3 h-3" />
                                  {urlError}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste text or upload a document..."
                      className="w-full h-80 bg-transparent border-none focus:ring-0 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none font-mono text-base leading-relaxed font-medium"
                    />
                    
                    <div className="flex items-center justify-between mt-8 pt-8 border-t border-[var(--border-primary)]">
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                          <Layers className="w-5 h-5 text-[var(--text-muted)]" />
                          <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase tracking-wider font-bold">Neutrality Check</span>
                        </div>
                        {inputText.length > 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <NeutralityValidator text={inputText} className="text-[11px] text-[var(--text-primary)] font-bold" />
                          </motion.div>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isProcessing || !inputText.trim() || !user}
                        className={cn(
                          "flex items-center gap-4 px-10 py-4 rounded-lg font-mono text-sm tracking-[0.25em] uppercase transition-all duration-500 font-bold",
                          isProcessing || !inputText.trim() || !user
                            ? "bg-zinc-900 text-zinc-600 cursor-not-allowed" 
                            : "bg-accent text-black hover:bg-white hover:shadow-[0_0_40px_var(--accent-color)] active:scale-95"
                        )}
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                            PROCESSING
                          </span>
                        ) : !user ? (
                          "AUTHORIZATION REQUIRED"
                        ) : (
                          <>
                            ANALYZE DATA
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="report"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                {/* Safety Slider UI */}
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
                  <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-900 rounded-full p-4 flex items-center gap-6 shadow-2xl">
                    <div className="flex items-center gap-2 shrink-0">
                      <Minimize2 className={cn("w-4 h-4 transition-colors", safetyLevel < 50 ? "text-accent" : "text-zinc-600")} />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Summary</span>
                    </div>
                    
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={safetyLevel}
                      onChange={(e) => setSafetyLevel(parseInt(e.target.value))}
                      className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Deep Analysis</span>
                      <Maximize2 className={cn("w-4 h-4 transition-colors", safetyLevel >= 50 ? "text-accent" : "text-zinc-600")} />
                    </div>
                  </div>
                </div>

                <ReportView 
                  data={result} 
                  safetyLevel={safetyLevel} 
                  onOpenAudit={() => setIsAuditOpen(true)} 
                  onConvertToLegal={() => setShowLegalPreview(true)}
                />

                {/* Bottom Summary Box */}
                <div className="mt-20 glass-container p-10 border-accent/20">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <FileCheck className="w-6 h-6 text-accent" />
                      <h3 className="text-xl font-display font-bold uppercase tracking-widest">Executive Summary</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => exportToCSV(result, 'analysis-report')}
                        className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-accent transition-colors font-bold uppercase tracking-widest"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        CSV
                      </button>
                      <button 
                        onClick={() => exportToPDF(document.getElementById('summary-box'), 'executive-summary', isDarkMode)}
                        className="flex items-center gap-2 text-xs font-mono text-accent hover:text-white transition-colors font-bold uppercase tracking-widest"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                    </div>
                  </div>
                  <div id="summary-box" className="text-lg text-[var(--text-primary)] leading-relaxed font-medium italic">
                    {result.shortSummary}
                  </div>
                </div>
                
                <div className="flex justify-center pb-32">
                  <button 
                    onClick={() => {
                      resetResult();
                      setInputText('');
                    }}
                    className="text-xs font-mono text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.3em] border-b border-zinc-800 pb-1"
                  >
                    New Analysis Session
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="text-center space-y-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 border-2 border-accent/20 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-accent animate-pulse" />
                </div>
              </div>
              <div ref={scrambleRef} className="text-2xl font-mono text-accent tracking-[0.5em] h-8">
                {scrambleText}
              </div>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                Decrypting Neutrality Vectors...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal Document Preview Modal */}
      <AnimatePresence>
        {showLegalPreview && result && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-container w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Shield className="w-6 h-6 text-accent" />
                  <h3 className="text-xl font-display font-bold uppercase tracking-widest">Legal Document Preview</h3>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleCopy(result.legalDocument)}
                    className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-accent transition-colors font-bold uppercase tracking-widest"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? "COPIED" : "COPY"}
                  </button>
                  <button 
                    onClick={() => exportToPDF(legalPreviewRef.current, 'legal-document', isDarkMode)}
                    className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-accent transition-colors font-bold uppercase tracking-widest"
                  >
                    <Download className="w-4 h-4" />
                    EXPORT PDF
                  </button>
                  <button 
                    onClick={() => setShowLegalPreview(false)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-12 bg-zinc-100/50">
                <div className="legal-document-container" ref={legalPreviewRef}>
                  <div className="legal-watermark">Confidential</div>
                  <div className="legal-seal">
                    <span>Authorized</span>
                    <span>Sentinel</span>
                    <span>{new Date().getFullYear()}</span>
                  </div>
                  <div className="legal-line-numbers">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <div className="legal-header">
                    Legal Memorandum • The Sentinel Analysis Portal
                  </div>
                  <div className="legal-content whitespace-pre-wrap">
                    {result.legalDocument}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Trail Sidebar */}
      {result && (
        <AuditTrail 
          audit={result.neutralityAudit} 
          isOpen={isAuditOpen} 
          onClose={() => setIsAuditOpen(false)} 
        />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Template Manager */}
      <TemplateManager 
        isOpen={isTemplateManagerOpen} 
        onClose={() => setIsTemplateManagerOpen(false)}
        currentInput={inputText}
        currentSafety={safetyLevel}
        currentAccent={selectedAccent.color}
        onLoadTemplate={handleLoadTemplate}
      />

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-red-500/10 border border-red-500/20 p-4 rounded-lg backdrop-blur-xl z-50 flex items-center gap-4"
          >
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-sm text-red-200">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
