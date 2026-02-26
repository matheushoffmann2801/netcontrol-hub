import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { login as apiLogin } from '../services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ════════════════════════════════════════
    MINIMALIST GRID — subtle network grid
   ════════════════════════════════════════ */
function GridPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />
  );
}

/* ════════════════════════════════════════
    RIPPLE BUTTON — matching system style
   ════════════════════════════════════════ */
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
        'relative w-full h-12 rounded-xl text-background text-sm font-bold overflow-hidden',
        'transition-all duration-300 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed bg-foreground',
        'shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{ width: 280, height: 280, left: r.x - 140, top: r.y - 140, transform: 'scale(0)', animation: 'rippleEffect 0.7s ease-out forwards' }}
        />
      ))}
    </button>
  );
}

/* ════════════════════════════════════════
    SPLASH SCREEN — extended ~5s animation (Matching colors)
   ════════════════════════════════════════ */
const SPLASH_PHASES = [
  { label: 'Autenticando...', pct: 30, delay: 0 },
  { label: 'Carregando módulos...', pct: 65, delay: 1200 },
  { label: 'Preparando painel...', pct: 90, delay: 2800 },
  { label: 'Bem-vindo!', pct: 100, delay: 4000 },
];

function SplashScreen({ name }: { name: string }) {
  const [phase, setPhase] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    SPLASH_PHASES.forEach((p, i) => {
      setTimeout(() => {
        setPhase(i);
        if (barRef.current) barRef.current.style.width = `${p.pct}%`;
      }, p.delay);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background">
      <div
        className="relative z-10 flex items-center justify-center"
        style={{
          width: 80,
          height: 80,
          borderRadius: 22,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #374151 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          animation: 'logoScale 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>NC</span>
      </div>

      <div className="mt-8 text-center" style={{ animation: 'textReveal 0.6s ease-out 0.9s both' }}>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] mb-2">Bem-vindo ao</p>
        <p className="text-foreground text-2xl font-black tracking-tight">NetControl Hub</p>
        <p className="text-muted-foreground text-sm mt-3">
          Olá, <span className="text-foreground font-semibold">{name}</span> 👋
        </p>
      </div>

      <div className="mt-8" style={{ animation: 'textReveal 0.4s ease-out 1.2s both' }}>
        <p className="text-muted-foreground/60 text-[11px] font-semibold tracking-wide h-4">
          {SPLASH_PHASES[phase]?.label}
        </p>
      </div>

      <div className="mt-4 w-48 h-[2px] bg-muted rounded-full overflow-hidden" style={{ animation: 'textReveal 0.4s ease-out 1.2s both' }}>
        <div
          ref={barRef}
          className="h-full bg-foreground transition-all duration-[1200ms] ease-out"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
    LOGIN PAGE — Premium Minimalist Design
   ════════════════════════════════════════════════ */
export function Login() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [splashVisible, setSplashVisible] = useState(false);
  const [splashName, setSplashName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

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
      setSplashName(name);
      setSplashVisible(true);
      setTimeout(() => navigate('/', { replace: true }), 5000);
    } catch {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes rippleEffect { to { transform: scale(1); opacity: 0; } }
        @keyframes logoScale {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes textReveal {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {splashVisible && <SplashScreen name={splashName} />}

      <div className="min-h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-background">
        <GridPattern />

        <div
          className={cn(
            'relative w-full max-w-[400px] mx-4 transition-all duration-700',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          {/* Logo area */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-[18px] flex items-center justify-center font-black text-xl text-white shadow-xl select-none mb-4"
              style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #374151 100%)' }}>
              NC
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">NetControl Hub</h1>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Control Plane</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground">Entrar</h2>
              <p className="text-muted-foreground text-xs mt-0.5">Acesse o painel para gerenciar licenças</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <input
                    type="email"
                    className="w-full h-11 bg-muted/40 border-border border rounded-xl pl-10 pr-4 text-sm focus:ring-1 focus:ring-foreground/10 outline-none transition-all"
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="w-full h-11 bg-muted/40 border-border border rounded-xl pl-10 pr-10 text-sm focus:ring-1 focus:ring-foreground/10 outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <RippleButton type="submit" loading={loading} disabled={loading || splashVisible}>
                  {loading ? 'Entrando...' : 'Acessar Central'}
                </RippleButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
