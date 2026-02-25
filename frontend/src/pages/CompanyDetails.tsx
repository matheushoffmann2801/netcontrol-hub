import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
    ArrowLeft, CheckCircle2, XCircle, Shield,
    Activity, Server, History, RefreshCcw, Power, Eye, Fingerprint, Database,
    Copy, Edit, Check
} from 'lucide-react';
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

interface AuditLog {
    id: string;
    action: string;
    details: string;
    ip: string;
    createdAt: string;
}

interface Telemetry {
    id: string;
    cpuUsage: number;
    ramUsage: number;
    activeUsers: number;
    timestamp: string;
}

export function CompanyDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [company, setCompany] = useState<Company | null>(null);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TELEMETRY' | 'AUDIT'>('OVERVIEW');
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (id) {
            loadCompanyData();
        }
    }, [id]);

    const loadCompanyData = async () => {
        try {
            const [compRes, logsRes, telRes] = await Promise.all([
                api.get(`/companies/${id}`),
                api.get(`/companies/${id}/logs`),
                api.get(`/companies/${id}/telemetry`)
            ]);
            setCompany(compRes.data);
            setLogs(logsRes.data);
            setTelemetry(telRes.data);
        } catch (error) {
            toast.error('Erro ao carregar os dados da empresa.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleForceSync = async () => {
        setIsActionLoading(true);
        try {
            await api.post(`/companies/${id}/force-sync`);
            toast.success('Comando de Sincronização Enfileirado!');
            loadCompanyData();
        } catch (error) {
            toast.error('Erro ao forçar sincronização.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRenewLicense = async () => {
        setIsActionLoading(true);
        try {
            await api.post(`/companies/${id}/renew`);
            toast.success('Licença renovada por +30 dias!');
            loadCompanyData();
        } catch (error) {
            toast.error('Erro ao renovar a licença.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const toggleStatus = async () => {
        if (!company) return;
        const newStatus = company.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        const confirmMsg = newStatus === 'SUSPENDED'
            ? 'Bloquear o acesso impedirá a instância do cliente de rodar. Mudar status para INADIMPLENTE?'
            : 'Desbloquear a empresa restabelecerá o acesso. Confirma?';

        if (!confirm(confirmMsg)) return;

        setIsActionLoading(true);
        try {
            await api.put(`/companies/${id}`, { status: newStatus });
            toast.success(`Empresa ${newStatus === 'ACTIVE' ? 'DEDBLOQUEADA' : 'BLOQUEADA'}!`);
            loadCompanyData();
        } catch (error) {
            toast.error('Erro ao operar o status da empresa.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteCompany = async () => {
        if (!company) return;
        const confirmMsg = `⚠️ EXCLUIR EMPRESA "${company.name}"?\n\nIsto removerá permanentemente a empresa, todas as licenças e dados associados. A instância do cliente será bloqueada no próximo heartbeat.\n\nEsta ação NÃO pode ser desfeita.`;

        if (!confirm(confirmMsg)) return;

        setIsActionLoading(true);
        try {
            await api.delete(`/companies/${id}`);
            toast.success('Empresa excluída com sucesso!');
            setTimeout(() => navigate('/companies'), 1000);
        } catch (error) {
            toast.error('Erro ao excluir empresa.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDocument, setEditDocument] = useState('');

    useEffect(() => {
        if (company) {
            setEditName(company.name);
            setEditDocument(company.document);
        }
    }, [company]);

    const handleSaveEdit = async () => {
        setIsActionLoading(true);
        try {
            const res = await api.put(`/companies/${id}`, {
                name: editName,
                document: editDocument,
                status: company?.status
            });
            toast.success('Empresa atualizada com sucesso!');
            if (res.data.newToken) {
                toast.success('Nova licença gerada automaticamente devido à alteração de cadastro.');
            }
            setEditMode(false);
            loadCompanyData();
        } catch (error) {
            toast.error('Erro ao atualizar empresa.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCopyToken = () => {
        if (!currentLicense) return;
        navigator.clipboard.writeText(currentLicense.token);
        toast.success('Token copiado para a área de transferência!');
    };

    const AVAILABLE_MODULES = [
        { id: 'BASE', name: 'Módulo Base' },
        { id: 'FINANCEIRO', name: 'Financeiro' },
        { id: 'INVENTARIO', name: 'Inventário' },
        { id: 'ATIVOS_FROTA', name: 'Ativos e Frota' },
        { id: 'OPERACIONAL', name: 'Operacional' },
        { id: 'PAINEL_TECNICO', name: 'Painel Técnico' },
        { id: 'CONTRATOS', name: 'Contratos' },
        { id: 'FULL_ACCESS', name: 'Master / Acesso Total' }
    ];

    const [editingModules, setEditingModules] = useState(false);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);

    const PREDEFINED_PLANS = [
        {
            name: 'Plano Básico',
            description: 'Gestão Financeira e Cadastros',
            modules: ['BASE', 'FINANCEIRO', 'INVENTARIO']
        },
        {
            name: 'Plano Plus',
            description: 'Gestão Completa c/ Operacional',
            modules: ['BASE', 'FINANCEIRO', 'INVENTARIO', 'OPERACIONAL', 'CONTRATOS']
        },
        {
            name: 'Acesso Total (Master)',
            description: 'Todos os módulos + Painel Técnico',
            modules: ['BASE', 'FINANCEIRO', 'INVENTARIO', 'ATIVOS_FROTA', 'OPERACIONAL', 'PAINEL_TECNICO', 'CONTRATOS', 'FULL_ACCESS']
        }
    ];

    const openModuleEditor = () => {
        setSelectedModules([...(currentLicense?.modules || [])]);
        setEditingModules(true);
    };

    const handleSaveModules = async () => {
        setIsActionLoading(true);
        try {
            await api.put(`/companies/${id}/modules`, {
                modules: selectedModules
            });
            toast.success('Módulos atualizados com sucesso! Nova licença gerada.');
            setEditingModules(false);
            loadCompanyData();
        } catch (error: any) {
            toast.error('Erro ao atualizar módulos.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const isOnline = useMemo(() => {
        if (!company?.lastSeenAt) return false;
        const lastSeen = new Date(company.lastSeenAt);
        const diffHours = (new Date().getTime() - lastSeen.getTime()) / (1000 * 60 * 60);
        return diffHours <= 2;
    }, [company]);

    const chartData = useMemo(() => {
        return telemetry.map(t => ({
            time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            cpu: t.cpuUsage,
            ram: t.ramUsage,
            users: t.activeUsers
        }));
    }, [telemetry]);

    if (loading || !company) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const currentLicense = company.licenses?.[company.licenses.length - 1];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Toaster richColors position="top-right" />

            {/* Top Navigation Row */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        {company.name}
                        {company.status === 'SUSPENDED' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                BLOQUEADA
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-gray-500 font-mono mt-0.5">{company.document}</p>
                </div>
                <div className="ml-auto flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                        {isOnline ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span className="text-xs font-bold uppercase tracking-wider">{isOnline ? 'Instância Online' : 'Instância Offline'}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200 pb-px">
                {[
                    { id: 'OVERVIEW', label: 'Visão Geral', icon: Eye },
                    { id: 'TELEMETRY', label: 'Telemetria do Servidor', icon: Activity },
                    { id: 'AUDIT', label: 'Logs de Auditoria', icon: History }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">

                    {/* Painel Esquerdo: Cards de Informação */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Database className="w-48 h-48" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-500" />
                                Detalhes da Licença
                            </h3>

                            {currentLicense ? (
                                <div className="grid grid-cols-2 gap-6 relative z-10">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 pl-1 mb-1">DATA DE EXPIRAÇÃO</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                defaultValue={currentLicense.expiresAt ? new Date(currentLicense.expiresAt).toISOString().split('T')[0] : ''}
                                                onChange={async (e) => {
                                                    if (!e.target.value) return;
                                                    setIsActionLoading(true);
                                                    try {
                                                        const result = await api.put(`/companies/${id}/expiration`, {
                                                            expiresAt: new Date(e.target.value).toISOString()
                                                        });
                                                        toast.success(result.data.message || 'Data de expiração alterada!');
                                                        loadCompanyData();
                                                    } catch (error: any) {
                                                        toast.error(error.response?.data?.error || 'Erro ao alterar expiração.');
                                                    } finally {
                                                        setIsActionLoading(false);
                                                    }
                                                }}
                                                className="text-lg font-bold text-gray-800 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1 pl-1">
                                            <p className="text-xs font-bold text-gray-400">MÓDULOS LIBERADOS</p>
                                            <button onClick={openModuleEditor} className="text-blue-500 hover:text-blue-700 p-1" title="Editar Módulos">
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {currentLicense.modules.length > 0 ? currentLicense.modules.map((m: string) => (
                                                <span key={m} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100">
                                                    {m}
                                                </span>
                                            )) : <span className="text-sm text-gray-400 italic">Nenhum</span>}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center justify-between mb-1 pl-1">
                                            <p className="text-xs font-bold text-gray-400">TOKEN GERADO (HASH)</p>
                                            <button onClick={handleCopyToken} className="flex items-center gap-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors">
                                                <Copy className="w-3.5 h-3.5" /> Copiar Licença
                                            </button>
                                        </div>
                                        <div className="font-mono text-[10px] text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100 break-all max-h-24 overflow-y-auto">
                                            {currentLicense.token}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Nenhuma licença gerada.</p>
                            )}
                        </div>
                    </div>

                    {/* Painel Direito: Ações Management */}
                    <div className="space-y-4">
                        <div className="bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Painel de Controle</h3>

                            <div className="space-y-3">
                                <button
                                    onClick={handleForceSync}
                                    disabled={isActionLoading || !isOnline}
                                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    <span>Forçar Sincronização</span>
                                </button>

                                <button
                                    onClick={handleRenewLicense}
                                    disabled={isActionLoading || company.status === 'CANCELED'}
                                    className="w-full flex items-center justify-center space-x-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200 p-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                                >
                                    <Shield className="w-4 h-4" />
                                    <span>Renovar +30 Dias</span>
                                </button>

                                <div className="border-t border-gray-200 my-4" />

                                <button
                                    onClick={toggleStatus}
                                    disabled={isActionLoading}
                                    className={`w-full flex items-center justify-center space-x-2 p-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${company.status === 'SUSPENDED'
                                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                        }`}
                                >
                                    <Power className="w-4 h-4" />
                                    <span>{company.status === 'SUSPENDED' ? 'Remover Bloqueio' : 'Bloquear Instância'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Card de Edição da Empresa */}
                        <div className="bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Editar Informações</h3>
                            {editMode ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Nome da Empresa</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">CNPJ / Documento</label>
                                        <input
                                            type="text"
                                            value={editDocument}
                                            onChange={(e) => setEditDocument(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={isActionLoading}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                        >
                                            {isActionLoading ? 'Salvando...' : 'Salvar'}
                                        </button>
                                        <button
                                            onClick={() => { setEditMode(false); setEditName(company.name); setEditDocument(company.document); }}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3.5 rounded-xl font-bold text-sm transition-all"
                                >
                                    <span>✏️ Editar Dados da Empresa</span>
                                </button>
                            )}
                        </div>

                        {/* Card Zona de Perigo */}
                        <div className="bg-red-50/50 backdrop-blur-xl p-5 rounded-3xl border border-red-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <h3 className="text-sm font-bold text-red-800 mb-3 uppercase tracking-widest">Zona de Perigo</h3>
                            <p className="text-xs text-red-600/70 mb-4">Excluir esta empresa removerá permanentemente todos os dados, licenças e histórico. A instância do cliente será bloqueada.</p>
                            <button
                                onClick={handleDeleteCompany}
                                disabled={isActionLoading}
                                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-red-500/25"
                            >
                                <span>🗑️ Excluir Empresa Permanentemente</span>
                            </button>
                        </div>
                    </div>

                    {/* Module Editor Modal */}
                    {editingModules && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Editar Módulos & Planos</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Defina pacotes ou escolha módulos isolados para gerar a licença.</p>
                                    </div>
                                    <button onClick={() => setEditingModules(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">

                                    {/* Presets de Planos */}
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Aplicar Plano Rápido</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {PREDEFINED_PLANS.map((plan, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedModules(plan.modules)}
                                                    className="flex items-start text-left p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/50 transition-colors group"
                                                >
                                                    <div className="bg-blue-100 text-blue-600 rounded-lg p-2 mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <Sparkles className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-blue-900">{plan.name}</p>
                                                        <p className="text-xs text-blue-700/70">{plan.description}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Módulos Individuais */}
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                                            <span>Módulos Individuais</span>
                                            <button onClick={() => setSelectedModules([])} className="text-red-500 hover:text-red-700 text-[10px] bg-red-50 px-2 py-1 rounded">Limpar Todos</button>
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {AVAILABLE_MODULES.map(mod => {
                                                const isChecked = selectedModules.includes(mod.id);
                                                return (
                                                    <button
                                                        key={mod.id}
                                                        onClick={() => {
                                                            if (isChecked) setSelectedModules(prev => prev.filter(m => m !== mod.id));
                                                            else setSelectedModules(prev => [...prev, mod.id]);
                                                        }}
                                                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${isChecked ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                                    >
                                                        <span className={`text-xs font-bold ${isChecked ? 'text-blue-700' : 'text-gray-700'}`}>{mod.name}</span>
                                                        <div className={`w-4 h-4 rounded-md flex items-center justify-center ${isChecked ? 'bg-blue-500 text-white' : 'border-2 border-gray-300'}`}>
                                                            {isChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                                    <button
                                        onClick={() => setEditingModules(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveModules}
                                        disabled={isActionLoading}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex justify-center items-center"
                                    >
                                        {isActionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Salvar Módulos'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* TAB CONTENT: TELEMETRY */}
            {activeTab === 'TELEMETRY' && (
                <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Server className="w-6 h-6 text-blue-500" />
                                Saúde do Servidor do Cliente
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Consumo de CPU e RAM reportados nos Últimos Heartbeats.</p>
                        </div>
                        {telemetry.length > 0 && (
                            <div className="flex space-x-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">CPU Atual</p>
                                    <p className="text-xl font-black text-gray-800">{telemetry[telemetry.length - 1].cpuUsage}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">RAM Atual</p>
                                    <p className="text-xl font-black text-gray-800">{telemetry[telemetry.length - 1].ramUsage}%</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-[400px] w-full">
                        {telemetry.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                                    <Area type="monotone" dataKey="cpu" name="CPU Usage (%)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" />
                                    <Area type="monotone" dataKey="ram" name="RAM Usage (%)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRam)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                                <Activity className="w-12 h-12 opacity-20" />
                                <p>Nenhuma telemetria recebida do cliente ainda.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: AUDIT LOGS */}
            {activeTab === 'AUDIT' && (
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-gray-100 flex items-center bg-gray-50/50">
                        <Fingerprint className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Rastreabilidade</h3>
                            <p className="text-sm text-gray-500">Histórico de ações (Audit Trail) deste cliente.</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Ação</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Descrição</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">IP Origem</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded-lg font-mono">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                            {log.details || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                            {log.ip || 'Local/Internal'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium text-right">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">Nenhum log de auditoria encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
}
