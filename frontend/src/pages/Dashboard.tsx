import React from 'react';
import {
  Users, Server, Activity, ShieldCheck,
  ArrowUpRight, Globe, Cpu
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import { getStats } from '../services/api';

const StatCard = ({ title, value, subtext, icon: Icon, trend, colorClass }: any) => (
  <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 group hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass}`}>
      <Icon size={80} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-slate-50 ${colorClass} bg-opacity-10`}>
          <Icon size={20} className={colorClass.replace('text-', 'text-')} />
        </div>
        <span className="text-slate-500 font-medium text-sm">{title}</span>
      </div>
      <div className="flex items-end gap-3">
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        {trend && (
          <span className="flex items-center text-emerald-600 text-xs font-bold mb-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <ArrowUpRight size={12} className="mr-1" /> {trend}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-xs mt-2">{subtext}</p>
    </div>
  </div>
);

export function Dashboard() {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando métricas...</div>;

  const statusData = [
    { name: 'Online', value: stats?.onlineInstances || 0, color: '#10B981' },
    { name: 'Offline', value: stats?.offlineInstances || 0, color: '#EF4444' }
  ];

  const growthData = stats?.growthData || [];
  const totalPercentage = stats?.activeCompanies ? Math.round((stats.onlineInstances / stats.activeCompanies) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Visão Geral</h1>
          <p className="text-slate-500 mt-1">Monitoramento em tempo real das instâncias NetControl.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
          </span>
          <span className="text-sm font-bold text-emerald-700">Sistema Operacional</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Empresas Ativas"
          value={stats?.activeCompanies || 0}
          subtext="Total na base"
          icon={Users}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Instâncias Online"
          value={stats?.onlineInstances || 0}
          subtext={`Última verificação: ${new Date().toLocaleTimeString()}`}
          icon={Server}
          colorClass="text-emerald-600"
        />
        <StatCard
          title="Módulos Licenciados"
          value={stats?.activeCompanies * 3 || 0}
          subtext="Total estimado"
          icon={Cpu}
          colorClass="text-purple-600"
        />
        <StatCard
          title="Planos Ativos"
          value={stats?.activeCompanies || 0}
          subtext="Assinaturas vigentes"
          icon={Activity}
          colorClass="text-amber-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Growth */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Globe size={18} className="text-blue-600" />
            Crescimento de Base
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActive)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            Saúde da Rede
          </h3>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-bold text-slate-800">{totalPercentage}%</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}