import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from 'lucide-react';
=======
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
import { useAuthStore } from '../store/useAuthStore';
import { login as apiLogin } from '../services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

<<<<<<< HEAD
/* ─── Animated Orb Background ─── */
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient backdrop */}
      <div className="absolute inset-0 bg-[#050814]" />

      {/* Large orb - top left */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
          animation: 'float1 8s ease-in-out infinite',
        }}
      />
      {/* Medium orb - bottom right */}
      <div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          animation: 'float2 10s ease-in-out infinite',
        }}
      />
      {/* Small orb - center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          animation: 'float3 6s ease-in-out infinite',
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,30px) scale(1.05)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,-40px) scale(1.08)} }
        @keyframes float3 { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-48%,-52%) scale(1.1)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes logoEntrance { 0%{opacity:0;transform:translateY(-20px) scale(0.8)} 60%{transform:translateY(4px) scale(1.05)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes successPulse { 0%{box-shadow:0 0 0 0 rgba(99,102,241,0.6)} 70%{box-shadow:0 0 0 20px rgba(99,102,241,0)} 100%{box-shadow:0 0 0 0 rgba(99,102,241,0)} }
        @keyframes ripple { 0%{transform:scale(0);opacity:0.5} 100%{transform:scale(4);opacity:0} }
        .animate-slide-up { animation: slideUp 0.6s ease forwards; }
        .animate-slide-up-delay-1 { animation: slideUp 0.6s ease 0.1s forwards; opacity:0; }
        .animate-slide-up-delay-2 { animation: slideUp 0.6s ease 0.2s forwards; opacity:0; }
        .animate-slide-up-delay-3 { animation: slideUp 0.6s ease 0.3s forwards; opacity:0; }
        .animate-slide-up-delay-4 { animation: slideUp 0.6s ease 0.4s forwards; opacity:0; }
        .animate-logo { animation: logoEntrance 0.8s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .animate-fade-in { animation: fadeIn 0.5s ease forwards; }
      `}</style>
    </div>
  );
}

/* ─── Success Overlay Animation ─── */
function SuccessOverlay({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[999] flex items-center justify-center transition-all duration-700',
        visible ? 'opacity-100 pointer-events-all' : 'opacity-0 pointer-events-none'
      )}
      style={{ background: visible ? 'rgba(5,8,20,0.96)' : 'transparent' }}
    >
      {visible && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"
            style={{ animation: 'successPulse 1.2s ease-out forwards' }}
          >
            <Zap className="w-9 h-9 text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">Acesso Autorizado</p>
            <p className="text-indigo-300 text-sm mt-1">Carregando o sistema...</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-500"
                style={{ animation: `float1 0.8s ease-in-out ${i * 0.15}s infinite` }}
              />
            ))}
          </div>
        </div>
=======
/* ────────────────────────────────────────
   PARTICLES (floating dots in dark section)
──────────────────────────────────────── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.25 + 0.05,
            animation: `float${i % 4} ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────
   GEOMETRIC PATTERN
──────────────────────────────────────── */
function GeometricPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 300" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <polygon points="0,30 30,0 60,30 30,60" fill="rgba(255,255,255,0.04)" />
          <polygon points="0,0 30,0 0,30" fill="rgba(255,255,255,0.03)" />
          <polygon points="30,0 60,0 60,30" fill="rgba(255,255,255,0.05)" />
          <polygon points="0,30 0,60 30,60" fill="rgba(255,255,255,0.03)" />
          <polygon points="60,30 60,60 30,60" fill="rgba(255,255,255,0.04)" />
        </pattern>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#geo)" />
      <ellipse cx="195" cy="150" rx="160" ry="130" fill="url(#glow)" />
      <polygon points="20,10 60,5 80,40 40,50" fill="rgba(255,255,255,0.03)" />
      <polygon points="280,20 340,10 360,60 300,65" fill="rgba(255,255,255,0.04)" />
      <polygon points="140,120 190,100 210,155 160,165" fill="rgba(255,255,255,0.025)" />
      <polygon points="310,150 370,140 380,200 320,210" fill="rgba(255,255,255,0.045)" />
    </svg>
  );
}

/* ────────────────────────────────────────
   UNDERLINE INPUT
──────────────────────────────────────── */
interface UnderlineInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function UnderlineInput({ label, icon, rightIcon, className, ...props }: UnderlineInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!(props.value as string);

  return (
    <div className="relative pb-1">
      {icon && (
        <div className={cn('absolute left-0 top-[26px] transition-colors duration-200 pointer-events-none', focused ? 'text-gray-700' : 'text-gray-400')}>{icon}</div>
      )}
      <label className={cn(
        'absolute transition-all duration-200 pointer-events-none select-none font-medium',
        (focused || hasValue) ? 'top-0 text-[10px] tracking-widest uppercase text-gray-500' : 'top-[26px] text-sm text-gray-400',
        icon ? 'left-6' : 'left-0'
      )}>
        {label}
      </label>
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        className={cn(
          'w-full bg-transparent border-0 border-b-2 outline-none pt-7 pb-2 text-sm text-gray-900 transition-colors duration-300 placeholder-transparent',
          focused ? 'border-gray-900' : 'border-gray-200',
          icon ? 'pl-6' : 'pl-0',
          rightIcon ? 'pr-8' : 'pr-0',
          className
        )}
      />
      {rightIcon && (
        <div className="absolute right-0 top-[26px] text-gray-400">{rightIcon}</div>
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
      )}
    </div>
  );
}

<<<<<<< HEAD
/* ─── Premium Input ─── */
interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: boolean;
=======
/* ────────────────────────────────────────
   RIPPLE BUTTON
──────────────────────────────────────── */
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
}

function PremiumInput({ label, icon, rightElement, error, className, ...props }: PremiumInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!(props.value as string);
  const isActive = focused || hasValue;

  return (
    <div className="relative group">
      <div
        className={cn(
          'relative flex items-center rounded-2xl border transition-all duration-300',
          isActive && !error
            ? 'border-indigo-500/60 bg-indigo-500/5 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'
            : error
              ? 'border-red-500/50 bg-red-500/5'
              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8',
        )}
      >
        <div className={cn(
          'absolute left-4 transition-colors duration-200',
          isActive ? 'text-indigo-400' : 'text-white/30'
        )}>
          {icon}
        </div>
        <div className="flex-1 pt-5 pb-2 pl-11 pr-4">
          <label
            className={cn(
              'absolute transition-all duration-200 pointer-events-none select-none font-medium',
              isActive
                ? 'top-2 text-[10px] tracking-widest uppercase text-indigo-400'
                : 'top-1/2 -translate-y-1/2 text-sm text-white/40'
            )}
          >
            {label}
          </label>
          <input
            {...props}
            onFocus={e => { setFocused(true); props.onFocus?.(e); }}
            onBlur={e => { setFocused(false); props.onBlur?.(e); }}
            className={cn(
              'w-full bg-transparent border-0 outline-none text-sm text-white placeholder-transparent font-medium',
              className
            )}
          />
        </div>
        {rightElement && (
          <div className="pr-4 flex items-center">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Ripple Button ─── */
function GlowButton({ loading, children, ...props }: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const ref = useRef<HTMLButtonElement>(null);

  const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const id = Date.now();
<<<<<<< HEAD
    setRipples(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800);
    props.onClick?.(e);
=======
    setRipples(p => [...p, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 700);
    onClick?.(e);
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
  };

  return (
    <button
      ref={ref}
<<<<<<< HEAD
      {...props}
      onClick={handleClick}
      className={cn(
        'relative w-full h-14 rounded-2xl text-white text-sm font-bold overflow-hidden transition-all duration-300',
        'bg-gradient-to-r from-indigo-600 to-violet-600',
        'hover:from-indigo-500 hover:to-violet-500 hover:shadow-[0_8px_32px_rgba(99,102,241,0.4)] hover:-translate-y-0.5',
        'active:scale-[0.98] active:translate-y-0',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
        props.className
=======
      onClick={handle}
      className={cn(
        'relative w-full h-14 rounded-full bg-gray-900 text-white text-sm font-semibold overflow-hidden',
        'transition-all duration-200 hover:bg-gray-700 active:scale-[0.98]',
        'disabled:opacity-60 disabled:cursor-not-allowed shadow-2xl shadow-black/20',
        className
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
      )}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)' }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
<<<<<<< HEAD
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Autenticando...
          </>
        ) : (
          <>
            Entrar no Sistema
            <ArrowRight className="w-4 h-4" />
          </>
=======
        {loading && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
        )}
      </span>
      {ripples.map(r => (
        <span
          key={r.id}
<<<<<<< HEAD
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{
            width: 200, height: 200,
            left: r.x - 100, top: r.y - 100,
            animation: 'ripple 0.8s ease-out forwards'
          }}
=======
          className="absolute rounded-full bg-white/15 pointer-events-none"
          style={{ width: 280, height: 280, left: r.x - 140, top: r.y - 140, transform: 'scale(0)', animation: 'rippleEffect 0.7s ease-out forwards' }}
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
        />
      ))}
    </button>
  );
}

/* ────────────────────────────────────────
   LOGIN PAGE
──────────────────────────────────────── */
export function Login() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
=======
  const [splashVisible, setSplashVisible] = useState(false);
  const [splashName, setSplashName] = useState('');
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (splashVisible && barRef.current) {
      requestAnimationFrame(() => {
        if (barRef.current) barRef.current.style.width = '100%';
      });
    }
  }, [splashVisible]);
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) { toast.error('Preencha e-mail e senha'); return; }
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      const local = data.admin?.email?.split('@')[0] ?? 'admin';
      const firstName = local.split(/[.\-_0-9]/)[0];
      const name = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      storeLogin(data.token, data.admin);
<<<<<<< HEAD
      setSuccess(true);
      await new Promise(r => setTimeout(r, 1800));
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
=======
      setSplashName(name);
      setSplashVisible(true);
      setTimeout(() => navigate('/', { replace: true }), 2400);
    } catch {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha.');
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
      setLoading(false);
    }
  };

  return (
    <>
<<<<<<< HEAD
      <SuccessOverlay visible={success} />

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />

        {/* Card */}
        <div
          className={cn(
            'relative z-10 w-full max-w-sm mx-4 rounded-3xl overflow-hidden transition-all duration-700',
            'border border-white/10',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Card header glow line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

          <div className="p-8">
            {/* Logo */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                animation: mounted ? 'logoEntrance 0.8s cubic-bezier(0.175,0.885,0.32,1.275) forwards' : 'none',
              }}
            >
              <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
=======
      <style>{`
        @keyframes rippleEffect { to { transform: scale(1); opacity: 0; } }
        @keyframes float0 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes float1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes float2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes float3 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes cardSlideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes logoEntrance { from { opacity: 0; transform: scale(0.6) rotate(-20deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes splashFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes logoScale {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          80% { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes textReveal { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ringPulse { 0% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.8); opacity: 0; } 100% { transform: scale(1.8); opacity: 0; } }
        @keyframes starFloat { 0% { transform: translateY(0) scale(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-120px) scale(1) rotate(720deg); opacity: 0; } }
      `}</style>

      {/* ── SUCCESS SPLASH ── */}
      {splashVisible && (
        <div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
          style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 100%)', animation: 'splashFade 0.3s ease-out forwards' }}
        >
          {[1, 2, 3].map(i => (
            <div key={i} className="absolute rounded-full border border-white/10" style={{ width: 80 + i * 80, height: 80 + i * 80, animation: `ringPulse 2s ease-out ${i * 0.3}s infinite` }} />
          ))}
          {[...Array(16)].map((_, i) => {
            const angle = (i / 16) * 360;
            const r = 80 + (i % 3) * 28;
            return (
              <div key={i} className="absolute text-white/50" style={{ left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * r}px)`, top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * r}px)`, animation: `starFloat 1.4s ease-out ${0.4 + i * 0.04}s both` }}>
                <Sparkles className="w-3 h-3" />
              </div>
            );
          })}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{ width: 88, height: 88, borderRadius: 24, background: '#ffffff', boxShadow: '0 0 80px rgba(255,255,255,0.25), 0 32px 64px rgba(0,0,0,0.5)', animation: 'logoScale 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}
          >
            <span style={{ fontSize: 30, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-2px' }}>NC</span>
          </div>
          <div className="mt-8 text-center" style={{ animation: 'textReveal 0.5s ease-out 0.8s both' }}>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.3em] mb-2">Bem-vindo ao</p>
            <p className="text-white text-2xl font-bold tracking-tight">NetControl Hub</p>
            <p className="text-white/60 text-sm mt-2">Olá, <span className="text-white font-semibold">{splashName}</span> 👋  Carregando painel...</p>
          </div>
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-white/10 rounded-full overflow-hidden" style={{ animation: 'textReveal 0.4s ease-out 1s both' }}>
            <div ref={barRef} className="h-full bg-gradient-to-r from-blue-400 to-white rounded-full transition-all duration-[1500ms] ease-out" style={{ width: '0%' }} />
          </div>
        </div>
      )}

      {/* ── LOGIN PAGE ── */}
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #e4e4e4 100%)' }}>
        <div
          className="relative flex flex-col overflow-hidden"
          style={{ width: '100%', maxWidth: 390, height: 'min(100dvh, 760px)', borderRadius: 'clamp(0px, 4vw, 36px)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.06)', animation: 'cardSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {/* Dark top */}
          <div className="relative flex-none flex flex-col items-center justify-center" style={{ height: '38%', background: '#141414' }}>
            <GeometricPattern />
            <Particles />
            <div
              className="relative z-10 flex items-center justify-center"
              style={{ width: 76, height: 76, borderRadius: 20, background: '#fff', boxShadow: '0 24px 48px rgba(0,0,0,0.45), 0 0 32px rgba(255,255,255,0.07)', animation: 'logoEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}
            >
              <span style={{ fontSize: 27, fontWeight: 900, color: '#141414', letterSpacing: '-1.5px' }}>NC</span>
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
            </div>
          </div>

<<<<<<< HEAD
            {/* Title */}
            <div className={cn('mb-8', mounted && 'animate-slide-up-delay-1')}>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                NetControl Hub
              </h1>
              <p className="text-white/40 text-sm mt-1 font-medium">
                Painel de Administração
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className={cn(mounted && 'animate-slide-up-delay-2')}>
                <PremiumInput
                  label="Endereço de E-mail"
                  icon={<Mail className="w-4 h-4" />}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className={cn(mounted && 'animate-slide-up-delay-3')}>
                <PremiumInput
                  label="Senha"
                  icon={<Lock className="w-4 h-4" />}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  rightElement={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(s => !s)}
                      className="text-white/30 hover:text-white/70 transition-colors duration-200 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              <div className={cn('pt-2', mounted && 'animate-slide-up-delay-4')}>
                <GlowButton type="submit" loading={loading} disabled={loading}>
                  Entrar no Sistema
                </GlowButton>
              </div>
            </form>

            {/* Footer */}
            <div className={cn('mt-6 text-center', mounted && 'animate-slide-up-delay-4')}>
              <p className="text-white/25 text-xs">
                NetControl Hub v2.0 · Sistema Licenciado
              </p>
            </div>
=======
          {/* White card */}
          <div className="flex-1 flex flex-col bg-white" style={{ borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: -28 }}>
            <form onSubmit={handleLogin} className="flex flex-col h-full px-8 pt-10 pb-8">
              <div className="mb-10">
                <h1 style={{ fontWeight: 300, fontSize: 32, color: '#141414', letterSpacing: '-0.5px', lineHeight: 1 }}>Entrar</h1>
                <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>Acesse o painel de controle</p>
              </div>

              <div className="mb-8">
                <UnderlineInput label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} autoComplete="email" />
              </div>

              <div className="mb-auto">
                <UnderlineInput
                  label="Senha"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button type="button" tabIndex={-1} onClick={() => setShowPass(s => !s)} className="cursor-pointer hover:text-gray-600 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  autoComplete="current-password"
                />
              </div>

              <div className="mt-auto">
                <RippleButton type="submit" loading={loading} disabled={loading || splashVisible}>
                  {loading ? 'Verificando...' : 'Entrar'}
                </RippleButton>
              </div>
            </form>
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
          </div>
        </div>
      </div>
    </>
  );
}
