import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, sendNotification } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
<<<<<<< HEAD
    ArrowLeft, CheckCircle2, XCircle, Shield, Cpu, MemoryStick,
    Activity, Server, History, RefreshCcw, Power, Eye, Fingerprint,
    Send, MessageSquare, Edit2, Save, X, Trash2, Wifi, WifiOff,
    AlertTriangle, Info, Users
=======
    ArrowLeft, CheckCircle2, XCircle, Shield,
    Activity, Server, History, RefreshCcw, Power, Eye, Fingerprint, Database,
    Copy, Edit, Check, Sparkles, Save
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Company {
    id: string; name: string; document: string; status: string;
    lastSeenAt: string | null; createdAt: string;
    licenses: any[];
    customization?: { systemName: string; primaryColor: string; logoUrl: string | null };
}
interface AuditLog { id: string; action: string; details: string; ip: string; createdAt: string; }
interface Telemetry { id: string; cpuUsage: number; ramUsage: number; activeUsers: number; timestamp: string; }

function Skeleton({ className }: { className?: string }) {
    return <div className={cn('animate-pulse rounded-xl bg-white/[0.05]', className)} />;
}

/* ─── Dark Notification Modal ─── */
function NotifModal({ open, onClose, company, onSend }: {
    open: boolean; onClose: () => void; company: Company | null; onSend: (d: any) => Promise<void>;
}) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('INFO');
    const [loading, setLoading] = useState(false);

    if (!open || !company) return null;

    const handleSend = async () => {
        if (!title || !message) return toast.error('Preencha título e mensagem');
        setLoading(true);
        try {
            await onSend({ title, message, type });
            setTitle(''); setMessage('');
            onClose();
        } finally { setLoading(false); }
    };

    const typeColors: Record<string, string> = {
        INFO: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        WARNING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        ERROR: 'bg-red-500/15 text-red-400 border-red-500/30',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div
                className="relative w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden"
                style={{
                    background: '#10111a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
                }}
            >
                <div className="h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-violet-400" />
                            Enviar Mensagem
                        </h2>
                        <p className="text-xs text-white/30 mt-0.5">Será exibida para <span className="text-white/60 font-semibold">{company.name}</span> em ~15s</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="px-6 pb-4 space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-1.5">Título</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Aviso de Manutenção"
                            className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder-white/20 text-sm outline-none focus:border-violet-500/50 transition-all" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-1.5">Mensagem</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                            placeholder="O sistema passará por manutenção às 23h..."
                            className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder-white/20 text-sm outline-none focus:border-violet-500/50 transition-all resize-none" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-1.5">Tipo</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['INFO', 'WARNING', 'ERROR'].map(t => (
                                <button key={t} onClick={() => setType(t)}
                                    className={cn(
                                        'py-2 text-xs font-bold rounded-xl border transition-all',
                                        type === t ? typeColors[t] : 'bg-white/[0.04] text-white/30 border-white/[0.07] hover:text-white/60'
                                    )}>
                                    {t === 'INFO' ? 'Info' : t === 'WARNING' ? 'Aviso' : 'Urgente'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-6 pt-3 border-t border-white/[0.06] flex gap-3">
                    <button onClick={onClose} className="flex-1 h-11 rounded-xl text-sm font-bold text-white/40 bg-white/[0.04] hover:bg-white/[0.07] transition-all">Cancelar</button>
                    <button
                        onClick={handleSend} disabled={loading || !title || !message}
                        className="flex-1 h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
                    >
                        <Send className="w-3.5 h-3.5" />
                        {loading ? 'Enviando...' : 'Enviar Agora'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Action Button ─── */
function ActionBtn({ icon: Icon, label, onClick, disabled, variant = 'default' }: any) {
    const variants: Record<string, string> = {
        default: 'bg-white/[0.05] text-white/70 border-white/[0.07] hover:bg-white/[0.08] hover:text-white',
        primary: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/25',
        success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25',
        warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25',
        danger: 'bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/25',
        violet: 'bg-violet-500/15 text-violet-400 border-violet-500/20 hover:bg-violet-500/25',
    };
    return (
        <button
            onClick={onClick} disabled={disabled}
            className={cn(
                'w-full flex items-center gap-3 h-10 px-4 rounded-xl text-sm font-bold border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
                variants[variant]
            )}
        >
            <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
            {label}
        </button>
    );
}

/* ─── Custom Chart Tooltip ─── */
function DarkTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#12141e] border border-white/10 rounded-xl px-3 py-2 shadow-2xl text-xs">
            <p className="text-white/40 mb-1.5">{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                    <span className="font-bold text-white">{p.value}%</span>
                    <span className="text-white/40">{p.name}</span>
                </div>
            ))}
        </div>
    );
}

/* ─── CompanyDetails ─── */
export function CompanyDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [company, setCompany] = useState<Company | null>(null);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TELEMETRY' | 'AUDIT'>('OVERVIEW');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [notifModalOpen, setNotifModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDocument, setEditDocument] = useState('');

    useEffect(() => { if (id) loadCompanyData(); }, [id]);

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
            setEditName(compRes.data.name);
            setEditDocument(compRes.data.document);
        } catch { toast.error('Erro ao carregar dados.'); }
        finally { setLoading(false); }
    };

    const withLoading = async (fn: () => Promise<void>) => {
        setIsActionLoading(true);
        try { await fn(); } finally { setIsActionLoading(false); }
    };

    const handleForceSync = () => withLoading(async () => {
        await api.post(`/companies/${id}/force-sync`);
        toast.success('Sync enfileirado!');
        loadCompanyData();
    });

    const handleRenewLicense = () => withLoading(async () => {
        await api.post(`/companies/${id}/renew`);
        toast.success('Licença renovada por +30 dias!');
        loadCompanyData();
    });

    const toggleStatus = () => withLoading(async () => {
        if (!company) return;
        const newStatus = company.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        if (!confirm(newStatus === 'SUSPENDED' ? 'Bloquear instância?' : 'Desbloquear empresa?')) return;
        await api.put(`/companies/${id}`, { status: newStatus });
        toast.success(`Empresa ${newStatus === 'ACTIVE' ? 'desbloqueada' : 'bloqueada'}!`);
        loadCompanyData();
    });

    const handleDelete = () => withLoading(async () => {
        if (!company) return;
        if (!confirm(`Excluir "${company.name}" permanentemente?`)) return;
        await api.delete(`/companies/${id}`);
        toast.success('Empresa excluída!');
        setTimeout(() => navigate('/companies'), 900);
    });

    const handleSaveEdit = () => withLoading(async () => {
        await api.put(`/companies/${id}`, { name: editName, document: editDocument, status: company?.status });
        toast.success('Empresa atualizada!');
        setEditMode(false);
        loadCompanyData();
    });

<<<<<<< HEAD
    const handleSendNotification = async (data: { title: string; message: string; type: string }) => {
        if (!company) return;
        await sendNotification(company.id, data);
        toast.success('Notificação enviada!');
        loadCompanyData();
=======
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
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
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
    const [activePlanTab, setActivePlanTab] = useState<'PRESET' | 'CUSTOM'>('PRESET');

    const handleSelectAll = () => setSelectedModules(AVAILABLE_MODULES.map(m => m.id));
    const handleClearAll = () => setSelectedModules([]);
    const isAllSelected = selectedModules.length === AVAILABLE_MODULES.length;

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
        return (Date.now() - new Date(company.lastSeenAt).getTime()) < 10 * 60 * 1000;
    }, [company]);

    const chartData = useMemo(() => telemetry.map(t => ({
        time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: t.cpuUsage, ram: t.ramUsage, users: t.activeUsers
    })), [telemetry]);

    const latestTel = telemetry[telemetry.length - 1];

    if (loading || !company) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-48" />
                        <Skeleton className="h-32" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-64" />
                    </div>
                </div>
            </div>
        );
    }

    const currentLicense = company.licenses?.[company.licenses.length - 1];
    const isSuspended = company.status === 'SUSPENDED';

    return (
        <>
            <NotifModal open={notifModalOpen} onClose={() => setNotifModalOpen(false)} company={company} onSend={handleSendNotification} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 flex-wrap">
                    <button
                        onClick={() => navigate('/companies')}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.07] transition-all shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-black text-white flex items-center gap-3 flex-wrap">
                            {company.name}
                            {isSuspended && (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                    BLOQUEADA
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-white/30 font-mono mt-0.5">{company.document}</p>
                    </div>
                    <div className={cn(
                        'flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold',
                        isOnline
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-white/[0.04] border-white/[0.07] text-white/30'
                    )}>
                        {isOnline ? <><Wifi className="w-3.5 h-3.5" /> Online</> : <><WifiOff className="w-3.5 h-3.5" /> Offline</>}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-white/[0.06] pb-px overflow-x-auto no-scrollbar">
                    {[
                        { id: 'OVERVIEW', label: 'Visão Geral', icon: Eye },
                        { id: 'TELEMETRY', label: 'Telemetria', icon: Activity },
                        { id: 'AUDIT', label: 'Auditoria', icon: History },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all duration-200 whitespace-nowrap',
                                activeTab === tab.id
                                    ? 'border-indigo-400 text-indigo-400'
                                    : 'border-transparent text-white/30 hover:text-white/60 hover:border-white/20'
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* OVERVIEW */}
                {activeTab === 'OVERVIEW' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Left: License + Edit */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* License Card */}
                            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
                                    <Shield className="w-4 h-4 text-indigo-400" />
                                    Detalhes da Licença
                                </h3>

                                {currentLicense ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Data de Expiração</p>
                                            <input
                                                type="date"
                                                defaultValue={currentLicense.expiresAt ? new Date(currentLicense.expiresAt).toISOString().split('T')[0] : ''}
                                                onChange={async (e) => {
                                                    if (!e.target.value) return;
                                                    try {
                                                        const result = await api.put(`/companies/${id}/expiration`, { expiresAt: new Date(e.target.value).toISOString() });
                                                        toast.success(result.data.message || 'Expiração alterada!');
                                                        loadCompanyData();
                                                    } catch { toast.error('Erro ao alterar expiração.'); }
                                                }}
                                                className="h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white text-sm outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                                            />
                                        </div>
<<<<<<< HEAD

                                        <div>
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Módulos Ativos</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {currentLicense.modules.length > 0
                                                    ? currentLicense.modules.map((m: string) => (
                                                        <span key={m} className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300/70 text-[10px] font-bold font-mono border border-indigo-500/10">
                                                            {m}
                                                        </span>
                                                    ))
                                                    : <span className="text-white/20 text-sm">Nenhum</span>
                                                }
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Token da Licença (Hash)</p>
                                            <div className="font-mono text-[9px] text-white/25 bg-white/[0.03] border border-white/[0.04] p-3 rounded-xl break-all max-h-20 overflow-y-auto">
                                                {currentLicense.token}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-white/30 italic text-sm">Nenhuma licença gerada.</p>
=======
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

                    {/* Module Editor Modal (Mobile-First Premium) */}
                    {editingModules && (
                        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4">
                            <div className="bg-white rounded-t-[32px] md:rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">

                                {/* Header */}
                                <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 relative">
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full md:hidden" />
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 mt-2 md:mt-0">Gestão de Acesso</h2>
                                        <p className="text-xs font-medium text-slate-500 mt-1">Defina o plano ou escolha módulos específicos.</p>
                                    </div>
                                    <button onClick={() => setEditingModules(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-full transition-colors mt-2 md:mt-0">
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Tabs Plana / Personalizado */}
                                <div className="flex px-6 md:px-8 pt-2 space-x-6 shrink-0 border-b border-slate-100">
                                    <button
                                        onClick={() => setActivePlanTab('PRESET')}
                                        className={`pb-3 text-sm font-bold border-b-2 transition-all tracking-wide ${activePlanTab === 'PRESET' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Planos Prontos
                                    </button>
                                    <button
                                        onClick={() => setActivePlanTab('CUSTOM')}
                                        className={`pb-3 text-sm font-bold border-b-2 transition-all tracking-wide ${activePlanTab === 'CUSTOM' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Módulos Individuais
                                    </button>
                                </div>

                                {/* Corpo Rolável */}
                                <div className="p-6 md:px-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">

                                    {activePlanTab === 'PRESET' && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                                            {PREDEFINED_PLANS.map((plan, idx) => {
                                                const isCurrentPlan = plan.modules.length === selectedModules.length && plan.modules.every(m => selectedModules.includes(m));
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedModules(plan.modules)}
                                                        className={`w-full flex items-center text-left p-4 rounded-2xl border-2 transition-all group relative overflow-hidden ${isCurrentPlan ? 'border-blue-500 bg-blue-50/80 shadow-sm' : 'border-slate-200/60 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                                                    >
                                                        {isCurrentPlan && <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full -mt-10 -mr-10" />}

                                                        <div className={`p-3 rounded-xl mr-4 shrink-0 transition-colors ${isCurrentPlan ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                                            {idx === 2 ? <Shield className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-0.5">
                                                                <p className={`text-base font-black ${isCurrentPlan ? 'text-blue-900' : 'text-slate-800'}`}>{plan.name}</p>
                                                                {isCurrentPlan && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                                                            </div>
                                                            <p className={`text-xs font-medium ${isCurrentPlan ? 'text-blue-700/80' : 'text-slate-500'}`}>{plan.description}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {activePlanTab === 'CUSTOM' && (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                            {/* Master Toggle */}
                                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center cursor-pointer" onClick={() => isAllSelected ? handleClearAll() : handleSelectAll()}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isAllSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        <Shield className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-sm">Acesso Master (Geral)</h4>
                                                        <p className="text-xs text-slate-500 font-medium">Habilitar absolutamente todos os módulos</p>
                                                    </div>
                                                </div>
                                                <button
                                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAllSelected ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                >
                                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAllSelected ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>

                                            {/* Modulos Matrix */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {AVAILABLE_MODULES.map(mod => {
                                                    const isChecked = selectedModules.includes(mod.id);
                                                    return (
                                                        <button
                                                            key={mod.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (isChecked) setSelectedModules(prev => prev.filter(m => m !== mod.id));
                                                                else setSelectedModules(prev => [...prev, mod.id]);
                                                            }}
                                                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isChecked ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                                        >
                                                            <span className={`text-sm font-bold ${isChecked ? 'text-blue-800' : 'text-slate-600'}`}>{mod.name}</span>
                                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-600 text-white shadow-sm' : 'border-2 border-slate-200 bg-slate-50'}`}>
                                                                {isChecked && <Check className="w-3.5 h-3.5" strokeWidth={3.5} />}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* Footer Actions */}
                                <div className="px-6 md:px-8 py-5 border-t border-slate-100 bg-white flex gap-3 shrink-0 pb-safe">
                                    <button
                                        onClick={() => setEditingModules(false)}
                                        className="flex-1 py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.98]"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveModules}
                                        disabled={isActionLoading || selectedModules.length === 0}
                                        className="flex-[2] py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 disabled:shadow-none active:scale-[0.98] flex justify-center items-center gap-2"
                                    >
                                        {isActionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Exportar Licença</>}
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
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
                                )}
                            </div>

                            {/* Edit Card */}
                            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-white">Informações da Empresa</h3>
                                    {!editMode && (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-white/70 transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Editar
                                        </button>
                                    )}
                                </div>
                                {editMode ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-1.5">Nome</label>
                                            <input value={editName} onChange={e => setEditName(e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white text-sm outline-none focus:border-indigo-500/50 transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-1.5">CNPJ / Documento</label>
                                            <input value={editDocument} onChange={e => setEditDocument(e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white text-sm outline-none focus:border-indigo-500/50 transition-all" />
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={handleSaveEdit} disabled={isActionLoading}
                                                className="flex-1 h-10 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                                <Save className="w-3.5 h-3.5" /> Salvar
                                            </button>
                                            <button onClick={() => { setEditMode(false); setEditName(company.name); setEditDocument(company.document); }}
                                                className="h-10 px-4 rounded-xl text-sm font-bold text-white/40 bg-white/[0.04] hover:bg-white/[0.07] transition-all">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1">Nome</p>
                                            <p className="font-semibold text-white/80">{company.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1">CNPJ</p>
                                            <p className="font-mono text-white/60">{company.document || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1">Cadastro</p>
                                            <p className="text-white/50">{new Date(company.createdAt).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1">Último Ping</p>
                                            <p className="text-white/50">{company.lastSeenAt ? new Date(company.lastSeenAt).toLocaleString('pt-BR') : 'Nunca'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="space-y-4">
                            {/* Control Panel */}
                            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                                <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-4">Painel de Controle</p>
                                <div className="space-y-2">
                                    <ActionBtn icon={RefreshCcw} label="Forçar Sincronização" onClick={handleForceSync} disabled={isActionLoading || !isOnline} variant="primary" />
                                    <ActionBtn icon={MessageSquare} label="Enviar Mensagem" onClick={() => setNotifModalOpen(true)} disabled={isActionLoading} variant="violet" />
                                    <ActionBtn icon={Shield} label="Renovar +30 Dias" onClick={handleRenewLicense} disabled={isActionLoading} variant="success" />
                                    <div className="border-t border-white/[0.06] my-3" />
                                    <ActionBtn
                                        icon={Power}
                                        label={isSuspended ? 'Remover Bloqueio' : 'Bloquear Instância'}
                                        onClick={toggleStatus}
                                        disabled={isActionLoading}
                                        variant={isSuspended ? 'warning' : 'danger'}
                                    />
                                </div>
                            </div>

                            {/* Quick Telemetry */}
                            {latestTel && (
                                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                                    <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-4">Saúde Atual</p>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'CPU', value: latestTel.cpuUsage, icon: Cpu, color: '#ef4444' },
                                            { label: 'RAM', value: latestTel.ramUsage, icon: MemoryStick, color: '#6366f1' },
                                            { label: 'Usuários', value: latestTel.activeUsers, icon: Users, color: '#10b981', isCount: true },
                                        ].map(({ label, value, icon: Icon, color, isCount }) => (
                                            <div key={label} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                                                    <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={1.8} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-white/40 font-medium">{label}</span>
                                                        <span className="text-white/80 font-bold">{isCount ? value : `${value}%`}</span>
                                                    </div>
                                                    {!isCount && (
                                                        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Danger Zone */}
                            <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-5">
                                <p className="text-[10px] font-bold text-red-400/60 uppercase tracking-widest mb-1">Zona de Perigo</p>
                                <p className="text-xs text-white/25 mb-4">Exclui permanentemente todos os dados.</p>
                                <button
                                    onClick={handleDelete} disabled={isActionLoading}
                                    className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-all disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir Empresa
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TELEMETRY */}
                {activeTab === 'TELEMETRY' && (
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Server className="w-5 h-5 text-indigo-400" />
                                    Telemetria do Servidor
                                </h3>
                                <p className="text-sm text-white/30 mt-1">CPU e RAM reportados nos últimos heartbeats</p>
                            </div>
                            {latestTel && (
                                <div className="flex gap-6">
                                    {[
                                        { label: 'CPU Atual', value: `${latestTel.cpuUsage}%`, color: '#ef4444' },
                                        { label: 'RAM Atual', value: `${latestTel.ramUsage}%`, color: '#6366f1' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="text-right">
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</p>
                                            <p className="text-xl font-black" style={{ color }}>{value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="h-[350px]">
                            {telemetry.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradRam" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                        <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <RechartsTooltip content={<DarkTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 2 }} />
                                        <Area type="monotone" dataKey="cpu" name="CPU" stroke="#ef4444" strokeWidth={2} fill="url(#gradCpu)" dot={false} activeDot={{ r: 4, fill: '#ef4444', stroke: '#070911', strokeWidth: 2 }} />
                                        <Area type="monotone" dataKey="ram" name="RAM" stroke="#6366f1" strokeWidth={2} fill="url(#gradRam)" dot={false} activeDot={{ r: 4, fill: '#6366f1', stroke: '#070911', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                                        <Activity className="w-8 h-8 text-white/20" />
                                    </div>
                                    <p className="text-white/30 text-sm">Nenhuma telemetria recebida ainda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* AUDIT */}
                {activeTab === 'AUDIT' && (
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.05] bg-white/[0.02]">
                            <Fingerprint className="w-4 h-4 text-white/30" />
                            <div>
                                <h3 className="text-sm font-bold text-white">Rastreabilidade</h3>
                                <p className="text-xs text-white/30">Audit Trail desta empresa</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                                        {['Ação', 'Descrição', 'IP', 'Data'].map(h => (
                                            <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-white/25 uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {logs.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-16 text-center text-white/25 text-sm">Nenhum log de auditoria.</td></tr>
                                    ) : logs.map(log => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded-lg bg-white/[0.05] text-indigo-300/70 text-[10px] font-bold font-mono border border-white/[0.06]">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white/60 font-medium">{log.details || '—'}</td>
                                            <td className="px-6 py-4 text-white/30 font-mono text-xs">{log.ip || 'Internal'}</td>
                                            <td className="px-6 py-4 text-white/25 text-xs">{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
