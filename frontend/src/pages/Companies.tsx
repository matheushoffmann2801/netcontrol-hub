import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import {
    Search, Plus, Trash2, Edit3, RotateCcw, CheckCircle2, XCircle, X,
    Building2, Shield, Clock, Copy, Eye, EyeOff, Loader2
} from 'lucide-react';
import { CompanyModal } from '../components/CompanyModal';
import { Toaster, toast } from 'sonner';

interface Company {
    id: string;
    name: string;
    document: string;
    status: string;
    lastSeenAt: string | null;
    createdAt: string;
    licenses: any[];
    customization?: { systemName: string; primaryColor: string; logoUrl: string | null };
}

export function Companies() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', document: '', status: '', systemName: '', primaryColor: '', logoUrl: '' });
    const [tokenVisible, setTokenVisible] = useState<{ [key: string]: boolean }>({});
    const [renewingId, setRenewingId] = useState<string | null>(null);
    const [editingModules, setEditingModules] = useState(false);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);

    // Lista fixa p/ edição rápida de módulos
    const AVAILABLE_MODULES = [
        { id: 'FINANCE', label: 'Financeiro' },
        { id: 'NOC', label: 'NOC / Monitoramento' },
        { id: 'SUPPORT', label: 'Suporte (Tickets)' },
        { id: 'STOCK', label: 'Estoque' },
        { id: 'CRM', label: 'CRM / Vendas' }
    ];

    useEffect(() => { loadCompanies(); }, []);

    const loadCompanies = async () => {
        try {
            const { data } = await api.get('/companies');
            setCompanies(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const getStatus = (lastSeenAt: string | null) => {
        if (!lastSeenAt) return 'OFFLINE';
        const diff = (Date.now() - new Date(lastSeenAt).getTime()) / (1000 * 60 * 60);
        return diff <= 2 ? 'ONLINE' : 'OFFLINE';
    };

    const getTimeAgo = (d: string | null) => {
        if (!d) return 'Nunca';
        const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
        if (s < 60) return 'Agora';
        if (s < 3600) return `${Math.floor(s / 60)}min`;
        if (s < 86400) return `${Math.floor(s / 3600)}h`;
        return `${Math.floor(s / 86400)}d`;
    };

    const openDetail = (company: Company) => {
        setSelectedCompany(company);
        setEditing(false);
        setEditForm({
            name: company.name,
            document: company.document || '',
            status: company.status,
            systemName: company.customization?.systemName || 'NetControl',
            primaryColor: company.customization?.primaryColor || '#000000',
            logoUrl: company.customization?.logoUrl || '',
        });

        // Pega os modulos da ultima licença p/ o form de edição de módulos
        const lastLic = company.licenses && company.licenses.length > 0
            ? company.licenses[company.licenses.length - 1]
            : null;

        setSelectedModules(lastLic ? (lastLic.modules || []) : []);
        setEditingModules(false);
    };

    const handleUpdate = async () => {
        if (!selectedCompany) return;
        try {
            await api.put(`/companies/${selectedCompany.id}`, editForm);
            toast.success('Empresa atualizada com sucesso!');
            setEditing(false);
            setSelectedCompany(null);
            loadCompanies();
        } catch { toast.error('Erro ao atualizar empresa'); }
    };

    const handleUpdateModules = async () => {
        if (!selectedCompany) return;
        if (!confirm('Atenção: Alterar módulos gerará uma NOVA licença. O token atual do cliente será re-emitido. Deseja continuar?')) return;

        try {
            const { data } = await api.put(`/companies/${selectedCompany.id}/modules`, {
                modules: selectedModules
            });
            toast.success('Módulos atualizados e nova licença gerada!');

            setEditingModules(false);
            loadCompanies();

            // Refresh detail
            const { data: updated } = await api.get(`/companies/${selectedCompany.id}`);
            setSelectedCompany(updated);

            // Auto copy new token
            if (data.token) {
                copyToken(data.token);
            }
        } catch { toast.error('Erro ao atualizar módulos da empresa'); }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        const confirmMsg = newStatus === 'SUSPENDED'
            ? 'Suspender a empresa por inadimplência bloqueará todo o acesso com base no heartbeat local. Deseja continuar?'
            : 'Desbloquear a empresa? O acesso será restaurado imediatamente.';

        if (!confirm(confirmMsg)) return;

        try {
            await api.put(`/companies/${id}`, { status: newStatus });
            toast.success(`Empresa ${newStatus === 'ACTIVE' ? 'DESBLOQUEADA' : 'BLOQUEADA'} com sucesso!`);

            // Atualiza local se tiver aberto
            if (selectedCompany?.id === id) {
                setSelectedCompany(prev => prev ? { ...prev, status: newStatus } : null);
                setEditForm(prev => ({ ...prev, status: newStatus }));
            }

            loadCompanies();
        } catch (error) {
            toast.error('Erro ao alterar status da empresa.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja REMOVER esta empresa e todas as suas licenças?')) return;
        try {
            await api.delete(`/companies/${id}`);
            toast.success('Empresa removida com sucesso!');
            setSelectedCompany(null);
            loadCompanies();
        } catch { toast.error('Erro ao remover empresa'); }
    };

    const handleRenew = async (id: string) => {
        setRenewingId(id);
        try {
            const { data } = await api.post(`/companies/${id}/renew`);
            toast.success('Licença renovada!', { description: `Válida até ${new Date(data.expiresAt).toLocaleDateString()}` });
            loadCompanies();
            // Refresh detail if open
            if (selectedCompany?.id === id) {
                const { data: updated } = await api.get(`/companies/${id}`);
                setSelectedCompany(updated);
            }
        } catch { toast.error('Erro ao renovar licença'); }
        finally { setRenewingId(null); }
    };

    const copyToken = (token: string) => {
        navigator.clipboard.writeText(token);
        toast.success('Token copiado!');
    };

    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.document && c.document.includes(searchTerm))
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Toaster richColors position="top-right" />
            <CompanyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadCompanies} />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestão de Empresas</h1>
                    <p className="text-gray-500 mt-1">Gerencie cadastros, licenças e personalizações.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nova Empresa</span>
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar empresa por nome ou CNPJ..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>
                <span className="text-sm text-gray-400 font-medium">{filtered.length} empresa(s)</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(company => {
                    const isOnline = getStatus(company.lastSeenAt) === 'ONLINE';
                    const modules = company.licenses?.[0]?.modules || [];
                    const lastLicense = company.licenses?.[company.licenses.length - 1];

                    return (
                        <div
                            key={company.id}
                            onClick={() => openDetail(company)}
                            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            {/* Status dot */}
                            <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />

                            <div className="flex items-start space-x-3 mb-4">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                                    style={{ background: company.customization?.primaryColor || '#3b82f6' }}
                                >
                                    {company.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{company.name}</h3>
                                    <p className="text-xs text-gray-400 font-mono">{company.document || 'Sem documento'}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Visto: {getTimeAgo(company.lastSeenAt)}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full font-bold border ${company.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    company.status === 'SUSPENDED' ? 'bg-amber-50 text-red-700 border-red-300 shadow-sm shadow-red-500/20' :
                                        'bg-red-50 text-red-600 border-red-200'
                                    }`}>
                                    {company.status === 'ACTIVE' ? 'Adimplente' : company.status === 'SUSPENDED' ? '⚠️ INADIMPLENTE' : 'Cancelado'}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {modules.length > 0 ? modules.map((m: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200 uppercase">{m}</span>
                                )) : <span className="text-gray-300 text-xs italic">Sem módulos</span>}
                            </div>

                            {lastLicense && (
                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center space-x-1">
                                        <Shield className="w-3 h-3" />
                                        <span>Licença até {new Date(lastLicense.expiresAt).toLocaleDateString()}</span>
                                    </div>
                                    {new Date(lastLicense.expiresAt) < new Date() && (
                                        <span className="text-red-500 font-bold">Expirada!</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="col-span-full flex flex-col items-center py-16">
                        <Building2 className="w-12 h-12 text-gray-200 mb-3" />
                        <p className="font-semibold text-gray-900">Nenhuma empresa encontrada</p>
                        <p className="text-sm text-gray-400 mt-1">Tente outro termo de busca ou cadastre uma nova empresa.</p>
                    </div>
                )}
            </div>

            {/* Detail Slide-Over */}
            {selectedCompany && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedCompany(null)} />
                    <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-y-auto">
                        {/* Detail Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedCompany.name}</h2>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedCompany.id}</p>
                            </div>
                            <button onClick={() => setSelectedCompany(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 flex-1">
                            {/* Connection Status */}
                            <div className="flex items-center space-x-3">
                                {getStatus(selectedCompany.lastSeenAt) === 'ONLINE' ? (
                                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200">
                                        <CheckCircle2 className="w-4 h-4" /> <span>Online</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-bold border border-red-200">
                                        <XCircle className="w-4 h-4" /> <span>Offline</span>
                                    </div>
                                )}
                                <span className="text-xs text-gray-400">Último ping: {getTimeAgo(selectedCompany.lastSeenAt)}</span>
                            </div>

                            {/* Edit Form / Detail */}
                            {editing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Nome</label>
                                        <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Documento</label>
                                        <input value={editForm.document} onChange={e => setEditForm({ ...editForm, document: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                                            <option value="ACTIVE">Ativo</option>
                                            <option value="SUSPENDED">Suspenso</option>
                                            <option value="CANCELED">Cancelado</option>
                                        </select>
                                    </div>
                                    <hr />
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Personalização</h4>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Nome no Sistema</label>
                                        <input value={editForm.systemName} onChange={e => setEditForm({ ...editForm, systemName: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Logo URL</label>
                                            <input value={editForm.logoUrl} onChange={e => setEditForm({ ...editForm, logoUrl: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Cor</label>
                                            <input type="color" value={editForm.primaryColor} onChange={e => setEditForm({ ...editForm, primaryColor: e.target.value })}
                                                className="w-10 h-10 mt-1 rounded cursor-pointer border-0" />
                                        </div>
                                    </div>

                                    <div className="flex space-x-3 pt-2">
                                        <button onClick={() => setEditing(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-all">Cancelar</button>
                                        <button onClick={handleUpdate} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25">Salvar</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase">Documento</p>
                                            <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCompany.document || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase">Status Financeiro</p>
                                            <p className={`text-sm font-bold mt-0.5 inline-block px-2 py-0.5 rounded border ${selectedCompany.status === 'ACTIVE' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                                selectedCompany.status === 'SUSPENDED' ? 'text-red-700 bg-red-50 border-red-200' : 'text-red-600 bg-red-100 border-red-300'
                                                }`}>
                                                {selectedCompany.status === 'ACTIVE' ? 'Adimplente (Liberado)' : selectedCompany.status === 'SUSPENDED' ? 'Inadimplente (Bloqueado)' : 'Cancelado Permanente'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase">Sistema</p>
                                            <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCompany.customization?.systemName || 'NetControl'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase">Cor</p>
                                            <div className="flex items-center space-x-2 mt-0.5">
                                                <div className="w-5 h-5 rounded-md border" style={{ background: selectedCompany.customization?.primaryColor || '#000' }} />
                                                <span className="text-sm font-mono text-gray-600">{selectedCompany.customization?.primaryColor}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 pt-2 flex-wrap gap-y-2">
                                        <button onClick={() => setEditing(true)} className="flex items-center space-x-1.5 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-all">
                                            <Edit3 className="w-4 h-4" /> <span>Editar Tudo</span>
                                        </button>

                                        {selectedCompany.status === 'SUSPENDED' ? (
                                            <button onClick={() => toggleStatus(selectedCompany.id, selectedCompany.status)} className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-sm hover:bg-emerald-100 transition-all shadow-sm border border-emerald-200">
                                                <span>Restaurar / Desbloquear</span>
                                            </button>
                                        ) : (
                                            <button onClick={() => toggleStatus(selectedCompany.id, selectedCompany.status)} className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 transition-all shadow-md shadow-red-500/25">
                                                <span>Bloquear (Inadimplência)</span>
                                            </button>
                                        )}

                                        <div className="w-full flex justify-end mt-4 pt-4 border-t border-gray-100">
                                            <button onClick={() => handleDelete(selectedCompany.id)} className="flex items-center space-x-1.5 px-4 py-2 text-gray-400 hover:text-red-600 font-semibold rounded-xl text-xs transition-all">
                                                <Trash2 className="w-4 h-4" /> <span>Excluir Permanentemente</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MODULES SECTION */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5"><Shield className="w-4 h-4 text-blue-500" /><span>Módulos Ativos</span></h3>
                                    {!editingModules ? (
                                        <button onClick={() => setEditingModules(true)} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200">
                                            Gerenciar Módulos
                                        </button>
                                    ) : (
                                        <div className="flex space-x-2">
                                            <button onClick={() => setEditingModules(false)} className="text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                                                Cancelar
                                            </button>
                                            <button onClick={handleUpdateModules} className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-blue-500/30">
                                                Salvar & Regerar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editingModules ? (
                                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-4 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="grid grid-cols-2 gap-3">
                                            {AVAILABLE_MODULES.map(mod => {
                                                const isSelected = selectedModules.includes(mod.id);
                                                return (
                                                    <div
                                                        key={mod.id}
                                                        onClick={() => setSelectedModules(prev => isSelected ? prev.filter(p => p !== mod.id) : [...prev, mod.id])}
                                                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-white border-blue-400 shadow-sm' : 'border-transparent hover:bg-white/50'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                                                            {isSelected && <CheckCircle2 className="w-3 h-3" />}
                                                        </div>
                                                        <span className={`text-xs font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-600'}`}>{mod.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {selectedModules.length > 0 ? selectedModules.map((m: string, i: number) => (
                                            <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 uppercase flex items-center space-x-1.5 shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span>{m}</span>
                                            </span>
                                        )) : <span className="text-gray-400 text-xs italic px-2">Sem módulos na última licença</span>}
                                    </div>
                                )}
                            </div>

                            {/* Licenses Section */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Histórico de Licenças</h3>
                                    <button
                                        onClick={() => handleRenew(selectedCompany.id)}
                                        disabled={renewingId === selectedCompany.id}
                                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-xs hover:bg-emerald-100 transition-all border border-emerald-200 disabled:opacity-50"
                                    >
                                        {renewingId === selectedCompany.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                        <span>Renovar (+30d)</span>
                                    </button>
                                </div>

                                {selectedCompany.licenses && selectedCompany.licenses.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedCompany.licenses.map((lic: any, i: number) => {
                                            const isExpired = new Date(lic.expiresAt) < new Date();
                                            const isLatest = i === selectedCompany.licenses.length - 1;
                                            return (
                                                <div key={lic.id} className={`p-4 border rounded-xl ${isLatest ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-gray-50/30'}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {isExpired ? 'Expirada' : 'Válida'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            Expira: {new Date(lic.expiresAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <code className="flex-1 text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg truncate select-all">
                                                            {tokenVisible[lic.id] ? lic.token : lic.token.substring(0, 30) + '...'}
                                                        </code>
                                                        <button onClick={(e) => { e.stopPropagation(); setTokenVisible(prev => ({ ...prev, [lic.id]: !prev[lic.id] })); }}
                                                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                                                            {tokenVisible[lic.id] ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); copyToken(lic.token); }}
                                                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                                                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                                                        </button>
                                                    </div>
                                                    {Array.isArray(lic.modules) && lic.modules.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {lic.modules.map((m: string, j: number) => (
                                                                <span key={j} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">{m}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Nenhuma licença gerada.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
