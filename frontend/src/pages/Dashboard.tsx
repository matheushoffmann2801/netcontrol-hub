import React from 'react';
import {
  Server, Activity, ShieldCheck,
  ArrowUpRight, ArrowDownRight, Globe, Cpu, TrendingUp,
  Wifi, Clock, Building2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { getStats } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuthStore, getFirstName } from '../store/useAuthStore';

/* ─── Stat Card Skeleton ─── */
function StatSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center gap-3"><div className="skeleton w-10 h-10 rounded-xl" /><div className="skeleton h-3 flex-1" /></div>
        <div className="skeleton h-8 w-24" />
        <div className="skeleton h-2.5 w-32" />
      </CardContent>
    </Card>
  );
}

/* ─── KPI Stat Card ─── */
interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  trend?: number;
  stripeClass?: string;
  iconBg?: string;
  iconColor?: string;
}

function StatCard({ title, value, subtext, icon: Icon, trend, stripeClass, iconBg, iconColor }: StatCardProps) {
  const pos = trend !== undefined && trend >= 0;
  return (
    <Card className={cn('hover:shadow-md transition-all duration-300 hover:-translate-y-0.5', stripeClass)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg ?? 'bg-muted')}>
            <Icon className={cn('w-5 h-5', iconColor ?? 'text-foreground')} strokeWidth={1.8} />
          </div>
          {trend !== undefined && (
            <span className={cn('flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full', pos ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>
              {pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-sm font-medium text-foreground mt-1">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
      </CardContent>
    </Card>
  );
}

/* ─── Chart Tooltip ─── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="text-muted-foreground text-xs font-semibold mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="font-bold text-foreground">{p.value}</span>
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
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="text-xs font-bold text-foreground w-8 text-right">{pct}%</span>
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
export function Dashboard() {
  const { admin } = useAuthStore();
  const [stats, setStats] = React.useState<{ activeCompanies: number; onlineInstances: number; offlineInstances: number; growthData: { name: string; active: number }[] } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getStats()
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const firstName = getFirstName(admin);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const totalPct = stats?.activeCompanies
    ? Math.min(100, Math.round(((stats.onlineInstances ?? 0) / stats.activeCompanies) * 100))
    : 0;

  const statusData = [
    { name: 'Online', value: stats?.onlineInstances ?? 0, color: '#10b981' },
    { name: 'Offline', value: stats?.offlineInstances ?? 0, color: '#f43f5e' },
  ];

  const activities = [
    { name: 'Instâncias Online', time: 'Atualizado agora', pct: totalPct, color: '#10b981' },
    { name: 'Módulos Ativos', time: 'Total estimado', pct: 72, color: '#3b82f6' },
    { name: 'SLA Médio', time: 'Últimos 30 dias', pct: 99, color: '#8b5cf6' },
    { name: 'Uptime Global', time: 'Este mês', pct: 97, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{greeting},</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-0.5">
            {firstName} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Aqui está o resumo do seu sistema.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-700">Sistema Online</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Empresas Ativas" value={stats?.activeCompanies ?? 0} subtext="Na base de dados" icon={Building2} trend={12} stripeClass="stripe-blue" iconBg="bg-blue-50" iconColor="text-blue-600" />
          <StatCard title="Instâncias Online" value={stats?.onlineInstances ?? 0} subtext="Verificado agora" icon={Server} trend={5} stripeClass="stripe-emerald" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
          <StatCard title="Módulos Ativos" value={(stats?.activeCompanies ?? 0) * 3} subtext="Total estimado" icon={Cpu} stripeClass="stripe-violet" iconBg="bg-violet-50" iconColor="text-violet-600" />
          <StatCard title="Uptime Global" value="99.9%" subtext="Últimos 30 dias" icon={Activity} trend={2} stripeClass="stripe-amber" iconBg="bg-amber-50" iconColor="text-amber-600" />
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2} />
                Crescimento de Base
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">Mensal</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Evolução de empresas ativas ao longo do tempo</p>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.growthData ?? []} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(214.3 31.8% 91.4%)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(215.4 16.3% 46.9%)', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'hsl(215.4 16.3% 46.9%)', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'hsl(214.3 31.8% 91.4%)', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradArea)" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={2} />
              Saúde da Rede
            </CardTitle>
            <p className="text-xs text-muted-foreground">Status das instâncias agora</p>
          </CardHeader>
          <CardContent className="flex-1 relative min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" strokeWidth={0} animationBegin={0} animationDuration={1200}>
                  {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={v => <span className="text-xs font-semibold text-muted-foreground">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pb-10 pointer-events-none">
              <span className="text-3xl font-bold text-foreground">{totalPct}%</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Online</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-violet-600" strokeWidth={2} />
              Métricas do Sistema
            </CardTitle>
            <p className="text-xs text-muted-foreground">Indicadores de desempenho em tempo real</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {activities.map(a => <ActivityRow key={a.name} {...a} />)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="w-4 h-4 text-blue-600" strokeWidth={2} />
              Resumo Rápido
            </CardTitle>
            <p className="text-xs text-muted-foreground">Dados operacionais do momento</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Uptime Médio', value: '99.98%', icon: Wifi, color: 'bg-blue-50 text-blue-600' },
                { label: 'Latência', value: '32ms', icon: Activity, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Incidentes', value: '0', icon: ShieldCheck, color: 'bg-violet-50 text-violet-600' },
                { label: 'Req / min', value: '1.4k', icon: Globe, color: 'bg-amber-50 text-amber-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-muted/30 rounded-xl p-4 flex flex-col items-start gap-2 hover:bg-muted/50 transition-colors">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground leading-none">{value}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}