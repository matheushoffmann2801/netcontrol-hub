import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { login as apiLogin } from '../services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────
   PARTICLES (floating background dots in dark section)
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
   GEOMETRIC PATTERN (dark polygon tiles)
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
   UNDERLINE INPUT (floating label)
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
        <div className={cn(
          'absolute left-0 top-[26px] transition-colors duration-200 pointer-events-none',
          focused ? 'text-gray-700' : 'text-gray-400'
        )}>{icon}</div>
      )}
      <label className={cn(
        'absolute transition-all duration-200 pointer-events-none select-none font-medium',
        (focused || hasValue)
          ? 'top-0 text-[10px] tracking-widest uppercase text-gray-500'
          : 'top-[26px] text-sm text-gray-400',
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
      )}
    </div>
  );
}

/* ────────────────────────────────────────
   SUCCESS SPLASH OVERLAY
──────────────────────────────────────── */
function SuccessSplash({ visible, name }: { visible: boolean; name: string }) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 100%)',
        animation: 'splashFade 0.3s ease-out forwards'
      }}
    >
      <style>{`
        @keyframes splashFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes logoScale {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          80% { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes textReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes starFloat {
          0% { transform: translateY(0) scale(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-120px) scale(1) rotate(720deg); opacity: 0; }
        }
        @keyframes float0 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes float1 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes float2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes float3 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      `}</style>

      {/* Rings */}
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="absolute rounded-full border border-white/10"
          style={{
            width: 80 + i * 80,
            height: 80 + i * 80,
            animation: `ringPulse 2s ease-out ${i * 0.3}s infinite`,
          }}
        />
      ))}

      {/* Stars */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * 360;
        const radius = 70 + Math.random() * 40;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * radius}px)`,
              top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * radius}px)`,
              animation: `starFloat 1.2s ease-out ${0.5 + i * 0.05}s forwards`,
            }}
          >
            <Sparkles className="w-4 h-4 text-white/60" />
          </div>
        );
      })}

      {/* NC Logo */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{
          width: 88, height: 88, borderRadius: 24,
          background: 'linear-gradient(135deg, #fff 0%, #e8e8e8 100%)',
          boxShadow: '0 0 80px rgba(255,255,255,0.2), 0 32px 64px rgba(0,0,0,0.5)',
          animation: 'logoScale 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
        }}
      >
        <span style={{ fontSize: 30, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-2px' }}>NC</span>
      </div>

      {/* Welcome text */}
      <div
        className="mt-8 text-center"
        style={{ animation: 'textReveal 0.5s ease-out 0.8s both' }}
      >
        <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.3em] mb-2">Bem-vindo ao</p>
        <p className="text-white text-2xl font-bold tracking-tight">NetControl Hub</p>
        <p className="text-white/60 text-sm mt-1">Olá, {name} 👋</p>
      </div>

      {/* Loading bar */}
      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 w-36 h-[2px] rounded-full bg-white/10 overflow-hidden"
        style={{ animation: 'textReveal 0.5s ease-out 1s both' }}
      >
        <div
          className="h-full bg-white/50 rounded-full"
          style={{ animation: 'shimmer 1s ease-in-out 1s forwards', width: '0%', transition: 'width 1.5s ease-in-out' }}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   RIPPLE BUTTON
──────────────────────────────────────── */
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

function RippleButton({ children, loading, className, onClick, ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const ref = useRef<HTMLButtonElement>(null);

  const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const id = Date.now();
    setRipples(p => [...p, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 700);
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      onClick={handle}
      className={cn(
        'relative w-full h-14 rounded-full bg-gray-900 text-white text-sm font-semibold overflow-hidden',
        'transition-all duration-200 hover:bg-gray-700 active:scale-[0.98]',
        'disabled:opacity-60 disabled:cursor-not-allowed shadow-2xl shadow-black/20',
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </span>
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/15 pointer-events-none"
          style={{
            width: 280, height: 280,
            left: r.x - 140, top: r.y - 140,
            transform: 'scale(0)',
            animation: 'rippleEffect 0.7s ease-out forwards'
          }}
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
  const [splashVisible, setSplashVisible] = useState(false);
  const [splashName, setSplashName] = useState('');
  const barRef = useRef<HTMLDivElement>(null);

  // Animate loading bar during splash
  useEffect(() => {
    if (splashVisible && barRef.current) {
      requestAnimationFrame(() => {
        if (barRef.current) barRef.current.style.width = '100%';
      });
    }
  }, [splashVisible]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) { toast.error('Preencha e-mail e senha'); return; }
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      // Compute first name before storing
      const local = data.admin?.email?.split('@')[0] ?? 'admin';
      const firstName = local.split(/[.\-_0-9]/)[0];
      const name = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      storeLogin(data.token, data.admin);
      setSplashName(name);
      setSplashVisible(true);
      // Navigate after splash animation
      setTimeout(() => navigate('/', { replace: true }), 2400);
    } catch {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes rippleEffect {
          to { transform: scale(1); opacity: 0; }
        }
        @keyframes float0 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes float1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes float2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes float3 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoEntrance {
          from { opacity: 0; transform: scale(0.6) rotate(-20deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes starFloat {
          0% { transform: translateY(0) scale(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-120px) scale(1) rotate(720deg); opacity: 0; }
        }
        @keyframes splashFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes logoScale {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          80% { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes textReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes barFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      {/* Splash overlay */}
      {splashVisible && (
        <div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
          style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 100%)', animation: 'splashFade 0.3s ease-out forwards' }}
        >
          {/* Pulse rings */}
          {[1, 2, 3].map(i => (
            <div key={i} className="absolute rounded-full border border-white/10" style={{ width: 80 + i * 80, height: 80 + i * 80, animation: `ringPulse 2s ease-out ${i * 0.3}s infinite` }} />
          ))}

          {/* Sparkle stars */}
          {[...Array(16)].map((_, i) => {
            const angle = (i / 16) * 360;
            const r = 80 + (i % 3) * 28;
            return (
              <div key={i} className="absolute text-white/50" style={{ left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * r}px)`, top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * r}px)`, animation: `starFloat 1.4s ease-out ${0.4 + i * 0.04}s both` }}>
                <Sparkles className="w-3 h-3" />
              </div>
            );
          })}

          {/* NC Logo */}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{ width: 88, height: 88, borderRadius: 24, background: '#ffffff', boxShadow: '0 0 80px rgba(255,255,255,0.25), 0 32px 64px rgba(0,0,0,0.5)', animation: 'logoScale 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}
          >
            <span style={{ fontSize: 30, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-2px' }}>NC</span>
          </div>

          {/* Text */}
          <div className="mt-8 text-center" style={{ animation: 'textReveal 0.5s ease-out 0.8s both' }}>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.3em] mb-2">Bem-vindo ao</p>
            <p className="text-white text-2xl font-bold tracking-tight">NetControl Hub</p>
            <p className="text-white/60 text-sm mt-2">Olá, <span className="text-white font-semibold">{splashName}</span> 👋  Carregando seu painel...</p>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-white/10 rounded-full overflow-hidden" style={{ animation: 'textReveal 0.4s ease-out 1s both' }}>
            <div ref={barRef} className="h-full bg-gradient-to-r from-blue-400 to-white rounded-full transition-all duration-[1500ms] ease-out" style={{ width: '0%' }} />
          </div>
        </div>
      )}

      {/* Login page */}
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #e4e4e4 100%)' }}>
        {/* Card */}
        <div
          className="relative flex flex-col overflow-hidden"
          style={{
            width: '100%', maxWidth: 390,
            height: 'min(100dvh, 760px)',
            borderRadius: 'clamp(0px, 4vw, 36px)',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.06)',
            animation: 'cardSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {/* Dark top */}
          <div className="relative flex-none flex flex-col items-center justify-center" style={{ height: '38%', background: '#141414' }}>
            <GeometricPattern />
            <Particles />
            {/* NC logo */}
            <div
              className="relative z-10 flex items-center justify-center"
              style={{ width: 76, height: 76, borderRadius: 20, background: '#fff', boxShadow: '0 24px 48px rgba(0,0,0,0.45), 0 0 32px rgba(255,255,255,0.07)', animation: 'logoEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}
            >
              <span style={{ fontSize: 27, fontWeight: 900, color: '#141414', letterSpacing: '-1.5px' }}>NC</span>
            </div>
          </div>

          {/* White bottom card */}
          <div className="flex-1 flex flex-col bg-white" style={{ borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: -28, animation: 'cardSlideUp 0.5s ease-out 0.15s both' }}>
            <form onSubmit={handleLogin} className="flex flex-col h-full px-8 pt-10 pb-8">
              {/* Title */}
              <div className="mb-10">
                <h1 style={{ fontWeight: 300, fontSize: 32, color: '#141414', letterSpacing: '-0.5px', lineHeight: 1 }}>
                  Entrar
                </h1>
                <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 6, fontWeight: 400 }}>
                  Acesse o painel de controle
                </p>
              </div>

              {/* E-mail */}
              <div className="mb-8">
                <UnderlineInput
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  autoComplete="email"
                />
              </div>

              {/* Senha */}
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

              {/* CTA */}
              <div className="mt-auto">
                <RippleButton type="submit" loading={loading} disabled={loading || splashVisible}>
                  {loading ? 'Verificando...' : 'Entrar'}
                </RippleButton>
                <p className="text-center text-xs text-gray-400 mt-6">
                  Não possui acesso?{' '}
                  <button type="button" className="text-gray-900 font-semibold hover:underline underline-offset-2">
                    Solicitar cadastro
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
