import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { login as apiLogin } from '../services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ─── Geometric Pattern SVG (dark polygon tiles matching reference image) ─── */
function GeometricPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 390 300"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <polygon points="0,30 30,0 60,30 30,60" fill="rgba(255,255,255,0.04)" />
          <polygon points="0,0 30,0 0,30" fill="rgba(255,255,255,0.03)" />
          <polygon points="30,0 60,0 60,30" fill="rgba(255,255,255,0.05)" />
          <polygon points="0,30 0,60 30,60" fill="rgba(255,255,255,0.03)" />
          <polygon points="60,30 60,60 30,60" fill="rgba(255,255,255,0.04)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#geo)" />
      <polygon points="20,10 60,5 80,40 40,50" fill="rgba(255,255,255,0.03)" />
      <polygon points="280,20 340,10 360,60 300,65" fill="rgba(255,255,255,0.04)" />
      <polygon points="140,120 190,100 210,155 160,165" fill="rgba(255,255,255,0.03)" />
      <polygon points="310,150 370,140 380,200 320,210" fill="rgba(255,255,255,0.05)" />
      <polygon points="10,200 70,185 80,240 20,255" fill="rgba(255,255,255,0.03)" />
    </svg>
  );
}

/* ─── Underline Input with floating label ─── */
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
        <div className="absolute left-0 top-[26px] text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
      <label
        className={cn(
          'absolute transition-all duration-200 pointer-events-none select-none',
          (focused || hasValue)
            ? 'top-0 text-[10px] text-gray-400 font-semibold tracking-widest uppercase'
            : 'top-[26px] text-sm text-gray-400',
          icon ? 'left-6' : 'left-0'
        )}
      >
        {label}
      </label>
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        className={cn(
          'w-full bg-transparent border-0 border-b-2 outline-none pt-7 pb-2 text-sm text-gray-900 transition-colors duration-200',
          focused ? 'border-gray-900' : 'border-gray-200',
          icon ? 'pl-6' : 'pl-0',
          rightIcon ? 'pr-8' : 'pr-0',
          className
        )}
      />
      {rightIcon && (
        <div className="absolute right-0 top-[26px] text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
}

/* ─── Ripple Button ─── */
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

function RippleButton({ children, loading, className, onClick, ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={cn(
        'relative w-full h-14 rounded-full bg-gray-900 text-white text-sm font-semibold overflow-hidden transition-all duration-200 hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </span>
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/20 animate-ripple pointer-events-none"
          style={{ width: 200, height: 200, left: r.x - 100, top: r.y - 100 }}
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
      navigate('/', { replace: true });
    } catch {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#f0f0f0' }}
    >
      {/* Phone-card wrapper — exato como a referência */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 390,
          height: 'min(100dvh, 760px)',
          borderRadius: 'clamp(0px, 4vw, 36px)',
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
      >
        {/* ── TOPO: Fundo escuro com padrão geométrico (38%) ── */}
        <div
          className="relative flex-none flex flex-col items-center justify-center"
          style={{ height: '38%', background: '#1a1a1a' }}
        >
          <GeometricPattern />
          {/* Logo NC — cartão branco quadrado */}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{
              width: 72, height: 72,
              borderRadius: 18,
              background: '#ffffff',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1.5px' }}>
              NC
            </span>
          </div>
        </div>

        {/* ── RODAPÉ: Cartão branco (62%) ── */}
        <div
          className="flex-1 flex flex-col bg-white"
          style={{ borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: -24 }}
        >
          <form onSubmit={handleLogin} className="flex flex-col h-full px-8 pt-10 pb-8">
            {/* Título */}
            <h1
              style={{
                fontWeight: 300, fontSize: 30,
                color: '#1a1a1a', letterSpacing: '-0.5px',
                lineHeight: 1, marginBottom: 40,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Entrar
            </h1>

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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(s => !s)}
                    className="cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="current-password"
              />
            </div>

            {/* Botão */}
            <div className="mt-auto">
              <RippleButton
                type="submit"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </RippleButton>

              {/* Link cadastro */}
              <p className="text-center text-xs text-gray-400 mt-6">
                Não possui uma conta?{' '}
                <button
                  type="button"
                  className="text-gray-900 font-semibold hover:underline"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
