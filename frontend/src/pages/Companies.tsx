import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Copy, CheckCircle2, ExternalLink, Building2,
  Wifi, WifiOff, Shield, ChevronRight
} from 'lucide-react';
import { CompanyModal } from '../components/CompanyModal';
import { getCompanies, createCompany } from '../services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-white/5', className)} />;
}

export function Companies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { loadCompanies(); }, []);

  const loadCompanies = () => {
    setLoading(true);
    getCompanies()
      .then(data => { setCompanies(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleCopyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Token copiado!');
  };

  const filtered = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.document?.toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = companies.filter(c => {
    if (!c.lastSeenAt) return false;
    return (Date.now() - new Date(c.lastSeenAt).getTime()) < 10 * 60 * 1000;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Empresas</h1>
          <p className="text-white/40 text-sm mt-1">
            {loading ? '...' : `${companies.length} total · ${onlineCount} online`}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.35)] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nova Empresa
        </button>
      </div>

      {/* Stats Row */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: companies.length, color: 'text-white' },
            { label: 'Online', value: onlineCount, color: 'text-emerald-400' },
            { label: 'Offline', value: companies.length - onlineCount, color: 'text-white/40' },
            { label: 'Suspensas', value: companies.filter(c => c.status === 'SUSPENDED').length, color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl p-4 border border-white/[0.06] bg-white/[0.03]"
            >
              <p className={cn('text-2xl font-black', color)}>{value}</p>
              <p className="text-xs text-white/40 font-medium uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          placeholder="Buscar empresa ou CNPJ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder-white/25 text-sm outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Empresa</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest hidden md:table-cell">Módulos</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest hidden lg:table-cell">Token</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white/20" />
                      </div>
                      <div>
                        <p className="text-white/60 font-medium">Nenhuma empresa encontrada</p>
                        <p className="text-white/30 text-sm mt-1">Cadastre a primeira empresa para começar</p>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar empresa
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((company) => {
                const license = company.licenses?.[0] || { token: 'N/A', modules: [] };
                const isOnline = company.lastSeenAt
                  ? (Date.now() - new Date(company.lastSeenAt).getTime()) < 10 * 60 * 1000
                  : false;
                const isSuspended = company.status === 'SUSPENDED';

                return (
                  <tr
                    key={company.id}
                    className="group hover:bg-white/[0.03] transition-all duration-150 cursor-pointer"
                    onClick={() => navigate(`/companies/${company.id}`)}
                  >
                    {/* Company */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                          {company.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-tight flex items-center gap-2">
                            {company.name}
                            {isSuspended && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-bold uppercase tracking-wider">
                                Suspenso
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-white/30 mt-0.5 font-mono">{company.document || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold',
                        isOnline
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white/5 text-white/30 border border-white/10'
                      )}>
                        {isOnline
                          ? <><Wifi className="w-3 h-3" /> Online</>
                          : <><WifiOff className="w-3 h-3" /> Offline</>
                        }
                      </div>
                    </td>

                    {/* Modules */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {license.modules.slice(0, 2).map((mod: string) => (
                          <span key={mod} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300/70 text-[9px] font-mono font-bold rounded-md border border-indigo-500/10">
                            {mod}
                          </span>
                        ))}
                        {license.modules.length > 2 && (
                          <span className="px-2 py-0.5 bg-white/5 text-white/30 text-[9px] font-bold rounded-md">
                            +{license.modules.length - 2}
                          </span>
                        )}
                        {license.modules.length === 0 && (
                          <span className="text-xs text-white/20">—</span>
                        )}
                      </div>
                    </td>

                    {/* Token */}
                    <td className="px-6 py-4 hidden lg:table-cell" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <code className="flex-1 bg-white/[0.04] rounded-lg px-2 py-1 text-[10px] text-white/30 font-mono truncate border border-white/[0.06]">
                          {license.token?.substring(0, 20)}…
                        </code>
                        {license.token !== 'N/A' && (
                          <button
                            onClick={() => handleCopyToken(license.token, company.id)}
                            className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-colors"
                          >
                            {copiedId === company.id
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              : <Copy className="w-3.5 h-3.5" />
                            }
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold text-indigo-400 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-500/20"
                        onClick={() => navigate(`/companies/${company.id}`)}
                      >
                        Detalhes <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-white/25">
            <span><span className="text-white/50 font-medium">{filtered.length}</span> empresa{filtered.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Protegido por JWT</span>
            </div>
          </div>
        )}
      </div>

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          try {
            const result = await createCompany(data);
            toast.success(result.message || 'Empresa criada!');
            loadCompanies();
            setIsModalOpen(false);
          } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao criar empresa.');
          }
        }}
      />
    </div>
  );
}