import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Copy, CheckCircle2, ExternalLink, Building2, Filter } from 'lucide-react';
import { CompanyModal } from '../components/CompanyModal';
import { getCompanies, createCompany } from '../services/api';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Empresas</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie licenças e acessos dos provedores.</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 h-10 px-5"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nova Empresa
        </Button>
      </div>

      {/* Search + Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa ou CNPJ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-10 bg-background"
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Empresa</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Módulos</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Token</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="skeleton h-4 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Building2 className="w-10 h-10 text-muted-foreground/30" />
                      <p className="text-muted-foreground text-sm font-medium">Nenhuma empresa encontrada</p>
                      <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar empresa
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((company) => {
                const license = company.licenses?.[0] || { token: 'N/A', modules: [] };
                let isOnline = false;
                if (company.lastSeenAt) {
                  const diffMs = Date.now() - new Date(company.lastSeenAt).getTime();
                  isOnline = diffMs < 10 * 60 * 1000;
                }

                return (
                  <tr
                    key={company.id}
                    className="group hover:bg-muted/20 transition-colors duration-150 cursor-pointer"
                    onClick={() => navigate(`/companies/${company.id}`)}
                  >
                    {/* Company */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center text-background text-xs font-bold shrink-0">
                          {company.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight">{company.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{company.document || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge variant={isOnline ? 'success' : 'secondary'} className="gap-1.5">
                        <span className={cn('w-1.5 h-1.5 rounded-full', isOnline ? 'bg-emerald-600' : 'bg-muted-foreground')} />
                        {isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </td>

                    {/* Modules */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {license.modules.slice(0, 2).map((mod: string) => (
                          <Badge key={mod} variant="outline" className="text-[9px] px-1.5 py-0 h-5 font-mono">
                            {mod}
                          </Badge>
                        ))}
                        {license.modules.length > 2 && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-5">
                            +{license.modules.length - 2}
                          </Badge>
                        )}
                        {license.modules.length === 0 && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>

                    {/* Token */}
                    <td className="px-6 py-4 hidden lg:table-cell" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2 max-w-[220px]">
                        <code className="flex-1 bg-muted rounded px-2 py-1.5 text-[10px] text-muted-foreground font-mono truncate">
                          {license.token?.substring(0, 24)}…
                        </code>
                        {license.token !== 'N/A' && (
                          <button
                            onClick={() => handleCopyToken(license.token, company.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            {copiedId === company.id
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              : <Copy className="w-3.5 h-3.5" />
                            }
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigate(`/companies/${company.id}`)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/10">
            <span>{filtered.length} empresa{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled className="h-7 text-xs">Anterior</Button>
              <Button variant="outline" size="sm" disabled className="h-7 text-xs">Próxima</Button>
            </div>
          </div>
        )}
      </Card>

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