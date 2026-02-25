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

interface Company {
  id: string;
  name: string;
  cnpj: string;
  licenseToken: string;
  modules: string[];
  createdAt: string;
  status?: 'online' | 'offline';
}

function CompanySkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-36" />
        <div className="skeleton h-2.5 w-24" />
      </div>
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
  );
}

export function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch {
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj?.includes(search)
  );

  const copyToken = async (token: string, id: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedId(id);
    toast.success('Token copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Empresas</h1>
          <p className="text-sm text-muted-foreground mt-1">{companies.length} empresa{companies.length !== 1 ? 's' : ''} cadastrada{companies.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Nova Empresa
        </Button>
      </div>

      {/* Search bar */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* List */}
      <Card className="overflow-hidden">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => <CompanySkeleton key={i} />)}
          </>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
            <Building2 className="w-10 h-10 opacity-30" />
            <p className="font-semibold">{search ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}</p>
            {!search && (
              <Button size="sm" onClick={() => setShowModal(true)} className="mt-2 gap-2">
                <Plus className="w-3.5 h-3.5" />
                Adicionar empresa
              </Button>
            )}
          </div>
        ) : (
          filtered.map((company, idx) => (
            <div
              key={company.id}
              className={cn(
                'group flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer',
                idx !== filtered.length - 1 && 'border-b border-border'
              )}
              onClick={() => navigate(`/companies/${company.id}`)}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                {company.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{company.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {company.cnpj || 'CNPJ não informado'}
                  {company.modules?.length > 0 && (
                    <span className="ml-2 text-muted-foreground/60">· {company.modules.length} módulo{company.modules.length !== 1 ? 's' : ''}</span>
                  )}
                </p>
              </div>

              {/* Modules preview */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                {(company.modules ?? []).slice(0, 3).map(m => (
                  <Badge key={m} variant="secondary" className="text-[10px] font-semibold">{m}</Badge>
                ))}
                {(company.modules?.length ?? 0) > 3 && (
                  <Badge variant="secondary" className="text-[10px]">+{company.modules.length - 3}</Badge>
                )}
              </div>

              {/* Status */}
              <Badge
                variant={company.status === 'online' ? 'default' : 'secondary'}
                className={cn(
                  'text-[10px] font-semibold shrink-0',
                  company.status === 'online' ? 'bg-emerald-100 text-emerald-700 border-0' : ''
                )}
              >
                {company.status === 'online' ? 'Online' : 'Offline'}
              </Badge>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); copyToken(company.licenseToken, company.id); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  title="Copiar token"
                >
                  {copiedId === company.id
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/companies/${company.id}`); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  title="Abrir detalhes"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <CompanyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={async (data: any) => {
            try {
              await createCompany(data);
              toast.success('Empresa criada com sucesso!');
              setShowModal(false);
              load();
            } catch {
              toast.error('Erro ao criar empresa');
            }
          }}
        />
      )}
    </div>
  );
}