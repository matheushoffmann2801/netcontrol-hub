import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { login as apiLogin } from '../services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
      )}
    </div>
  );
}

/* ─── Premium Input ─── */
interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: boolean;
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const id = Date.now();
    setRipples(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800);
    props.onClick?.(e);
  };

  return (
    <button
      ref={ref}
      {...props}
      onClick={handleClick}
      className={cn(
        'relative w-full h-14 rounded-2xl text-white text-sm font-bold overflow-hidden transition-all duration-300',
        'bg-gradient-to-r from-indigo-600 to-violet-600',
        'hover:from-indigo-500 hover:to-violet-500 hover:shadow-[0_8px_32px_rgba(99,102,241,0.4)] hover:-translate-y-0.5',
        'active:scale-[0.98] active:translate-y-0',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
        props.className
      )}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)' }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
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
        )}
      </span>
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{
            width: 200, height: 200,
            left: r.x - 100, top: r.y - 100,
            animation: 'ripple 0.8s ease-out forwards'
          }}
        />
      ))}
    </button>
  );
}

/* ─── Login Page ─── */
export function Login() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) {
      toast.error('Preencha e-mail e senha');
      return;
    }
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      storeLogin(data.token, data.admin);
      setSuccess(true);
      await new Promise(r => setTimeout(r, 1800));
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      setLoading(false);
    }
  };

  return (
    <>
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
            </div>

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
          </div>
        </div>
      </div>
    </>
  );
}
