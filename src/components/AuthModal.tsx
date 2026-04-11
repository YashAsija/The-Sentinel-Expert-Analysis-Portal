import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Shield, Mail, Lock, X, Github, Chrome, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isReset) {
        await sendPasswordResetEmail(auth, email);
        setMessage('Password reset email sent. Check your inbox.');
        setIsReset(false);
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      setError(err.message);
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
            className="glass-container w-full max-w-md overflow-hidden flex flex-col relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 pt-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-accent rounded-2xl mb-6 shadow-[0_0_30px_rgba(var(--accent-color-rgb),0.2)]">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-3xl font-display font-bold tracking-tighter uppercase mb-2">
                {isReset ? 'Reset Access' : isLogin ? 'Agent Login' : 'New Registration'}
              </h2>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
                The Sentinel Security Protocol
              </p>
            </div>

            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm font-mono focus:border-accent outline-none transition-all"
                      placeholder="agent@sentinel.io"
                    />
                  </div>
                </div>

                {!isReset && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold ml-1">Access Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm font-mono focus:border-accent outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                {message && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs font-mono"
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    {message}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-black py-4 rounded-xl font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white transition-all shadow-lg hover:shadow-accent/20 flex items-center justify-center gap-2 group"
                >
                  {loading ? 'PROCESSING...' : isReset ? 'SEND RESET LINK' : isLogin ? 'AUTHORIZE ACCESS' : 'CREATE ACCOUNT'}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between">
                <button 
                  onClick={() => {
                    setIsReset(!isReset);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-[10px] font-mono text-zinc-500 hover:text-accent transition-colors font-bold uppercase tracking-widest"
                >
                  {isReset ? 'Back to Login' : 'Forgot Access Key?'}
                </button>
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setIsReset(false);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-[10px] font-mono text-zinc-500 hover:text-accent transition-colors font-bold uppercase tracking-widest"
                >
                  {isLogin ? 'Request New ID' : 'Existing Agent?'}
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800/50">
                <p className="text-[10px] font-mono text-zinc-600 text-center uppercase tracking-widest mb-4 font-bold">External Verification</p>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center gap-3 bg-zinc-900/50 border-2 border-zinc-800 hover:border-accent/50 py-3 rounded-xl transition-all group"
                  >
                    <Chrome className="w-4 h-4 text-zinc-400 group-hover:text-accent transition-colors" />
                    <span className="text-[10px] font-mono text-zinc-400 group-hover:text-white transition-colors font-bold uppercase tracking-widest">Continue with Google</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
