import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { CompanyModal } from '../components/CompanyModal';
import { getCompanies, createCompany } from '../services/api';
import { toast } from 'sonner';

export function Companies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = () => {
    setLoading(true);
    getCompanies().then(data => {
      setCompanies(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const handleCopyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Empresas</h1>
          <p className="text-slate-500 mt-1">Gerencie licenças e acessos dos provedores.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus size={20} />
          Nova Licença
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome, CNPJ ou ID..."
          className="w-full bg-white border border-slate-200 text-slate-800 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Módulos</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Token de Licença</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Carregando empresas...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma empresa encontrada.
                  </td>
                </tr>
              ) : companies.map((company) => {
                const license = company.licenses?.[0] || { token: 'N/A', modules: [] };

                // Determinar se está online baseado no lastSeenAt
                let isOnline = false;
                if (company.lastSeenAt) {
                  const diffMs = new Date().getTime() - new Date(company.lastSeenAt).getTime();
                  isOnline = diffMs < 10 * 60 * 1000;
                }
                const displayStatus = isOnline ? 'Online' : 'Offline';
                const statusColorClass = isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200';

                return (
                  <tr key={company.id} className="group hover:bg-slate-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {company.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{company.name}</div>
                          <div className="text-sm text-slate-500">{company.document || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColorClass}`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {license.modules.slice(0, 2).map((mod: string) => (
                          <span key={mod} className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                            {mod}
                          </span>
                        ))}
                        {license.modules.length > 2 && (
                          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                            +{license.modules.length - 2}
                          </span>
                        )}
                        {license.modules.length === 0 && (
                          <span className="text-xs text-slate-400">Nenhum</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <div className="flex-1 bg-slate-50 rounded px-3 py-1.5 border border-slate-200 text-xs text-slate-500 font-mono truncate select-all">
                          {license.token}
                        </div>
                        {license.token !== 'N/A' && (
                          <button
                            onClick={() => handleCopyToken(license.token, company.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-blue-600 transition-colors"
                            title="Copiar Token"
                          >
                            {copiedId === company.id ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/companies/${company.id}`)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                        title="Gerenciar Empresa"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination (Visual Only) */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <span>Mostrando 2 de 2 resultados</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled>Próxima</button>
          </div>
        </div>
      </div>

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          try {
            const result = await createCompany(data);
            toast.success(result.message || 'Empresa criada com sucesso!');
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