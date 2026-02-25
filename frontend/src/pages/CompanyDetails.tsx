import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, sendNotification } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
    ArrowLeft, CheckCircle2, XCircle, Shield, Cpu, MemoryStick,
    Activity, Server, History, RefreshCcw, Power, Eye, Fingerprint,
    Send, MessageSquare, Edit2, Save, X, Trash2, Wifi, WifiOff,
    AlertTriangle, Info, Users
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

    const handleSendNotification = async (data: { title: string; message: string; type: string }) => {
        if (!company) return;
        await sendNotification(company.id, data);
        toast.success('Notificação enviada!');
        loadCompanyData();
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
