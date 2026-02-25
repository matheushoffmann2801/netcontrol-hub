import React from 'react';
import {
  Users, Server, Activity, TrendingUp, Globe, Cpu,
  ArrowUpRight, ArrowDownRight, Wifi, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { getStats } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '@/lib/utils';

/* ─── Skeleton ─── */
function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-white/[0.05]', className)} />;
}

/* ─── KPI Card ─── */
interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  trend?: number;
  accent?: string;
}

function StatCard({ title, value, subtext, icon: Icon, trend, accent = '#6366f1' }: StatCardProps) {
  const trendUp = trend !== undefined && trend >= 0;
  return (
    <div
      className="relative rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02] overflow-hidden group hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Subtle glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30"
        style={{ background: accent }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}20`, boxShadow: `0 0 20px ${accent}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: accent }} strokeWidth={1.8} />
          </div>
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full',
              trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            )}>
              {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
        <p className="text-sm font-semibold text-white/70 mt-1">{title}</p>
        <p className="text-xs text-white/30 mt-0.5">{subtext}</p>
      </div>
    </div>
  );
}

/* ─── Custom Tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#12141e] border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="text-white/40 text-xs font-semibold mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="font-bold text-white">{p.value}</span>
          <span className="text-white/40 text-xs">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Activity Row ─── */
function ActivityRow({ name, time, pct, color }: { name: string; time: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/80">{name}</p>
        <p className="text-xs text-white/30">{time}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-24 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="text-xs font-black text-white/60 w-8 text-right">{pct}%</span>
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
export function Dashboard() {
  const { admin } = useAuthStore();
  const [stats, setStats] = React.useState<{
    activeCompanies: number;
    onlineInstances: number;
    offlineInstances: number;
    telemetry?: { avgCpu: number; avgRam: number; totalUsers: number };
    growthData: { name: string; active: number }[];
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getStats()
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const firstName = admin?.email?.split('@')[0] ?? 'Admin';
  const capitalFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const statusData = [
    { name: 'Online', value: stats?.onlineInstances ?? 0, color: '#10b981' },
    { name: 'Offline', value: stats?.offlineInstances ?? 0, color: '#6366f1' },
  ];

  const growthData = stats?.growthData ?? [];
  const totalPct = stats?.activeCompanies
    ? Math.min(100, Math.round(((stats.onlineInstances ?? 0) / stats.activeCompanies) * 100))
    : 0;

  const activities = [
    { name: 'Instâncias Online', time: 'Verificado agora', pct: totalPct, color: '#10b981' },
    { name: 'Uso de CPU (Média)', time: 'Tempo Real', pct: stats?.telemetry?.avgCpu ?? 0, color: '#ef4444' },
    { name: 'Uso de RAM (Média)', time: 'Tempo Real', pct: stats?.telemetry?.avgRam ?? 0, color: '#6366f1' },
    { name: 'SLA Global', time: 'Últimos 30 dias', pct: 99, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/40 font-medium">{greeting},</p>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
            {capitalFirst} 👋
          </h1>
          <p className="text-sm text-white/30 mt-1">Resumo em tempo real do sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs font-bold text-emerald-400">Sistema Online</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/30 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.06]">
            <Clock className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Empresas Ativas" value={stats?.activeCompanies ?? 0} subtext="Total na base" icon={Users} trend={12} accent="#6366f1" />
          <StatCard title="Instâncias Online" value={stats?.onlineInstances ?? 0} subtext="Verificado agora" icon={Server} trend={5} accent="#10b981" />
          <StatCard title="Usuários Conectados" value={stats?.telemetry?.totalUsers ?? 0} subtext="Nas instâncias ativas" icon={Users} accent="#8b5cf6" />
          <StatCard title="CPU Média" value={`${stats?.telemetry?.avgCpu ?? 0}%`} subtext="Todas as instâncias" icon={Cpu} accent="#f59e0b" />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" strokeWidth={2} />
                Crescimento de Base
              </h3>
              <p className="text-xs text-white/30 mt-0.5">Evolução de empresas ativas</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/[0.05] text-white/40 uppercase tracking-widest">Mensal</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="active" name="Empresas" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradIndigo)" dot={false} activeDot={{ r: 5, fill: '#6366f1', stroke: '#0a0b10', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" strokeWidth={2} />
              Saúde da Rede
            </h3>
            <p className="text-xs text-white/30 mt-0.5">Status das instâncias</p>
          </div>
          <div className="flex-1 relative min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={60} outerRadius={82} paddingAngle={4} dataKey="value" strokeWidth={0} animationBegin={0} animationDuration={1200}>
                  {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs font-semibold text-white/40">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pb-10 pointer-events-none">
              <span className="text-3xl font-black text-white">{totalPct}%</span>
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Metrics */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="font-bold text-white flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-violet-400" strokeWidth={2} />
            Métricas do Sistema
          </h3>
          <div className="space-y-5">
            {activities.map(a => <ActivityRow key={a.name} {...a} />)}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="font-bold text-white flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-blue-400" strokeWidth={2} />
            Resumo Rápido
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'CPU Média', value: `${stats?.telemetry?.avgCpu ?? 0}%`, color: '#ef4444' },
              { label: 'RAM Média', value: `${stats?.telemetry?.avgRam ?? 0}%`, color: '#6366f1' },
              { label: 'Usu. Ativos', value: `${stats?.telemetry?.totalUsers ?? 0}`, color: '#8b5cf6' },
              { label: 'Uptime SLA', value: '99.9%', color: '#10b981' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.04] flex flex-col gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <p className="text-xl font-black text-white mt-1">{value}</p>
                <p className="text-xs text-white/30 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}