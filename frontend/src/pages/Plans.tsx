import { useState, useEffect } from 'react';
import { Plus, Package, Trash2, Edit, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { getPlans, createPlan, updatePlan, deletePlan } from '../services/api';
import { cn } from '@/lib/utils';

const CONST_MODULES = [
    { id: 'BASE', name: 'Base / CRM', icon: '🏢' },
    { id: 'FINANCEIRO', name: 'Financeiro', icon: '💰' },
    { id: 'INVENTARIO', name: 'Inventário', icon: '📦' },
    { id: 'ATIVOS_FROTA', name: 'Ativos e Frota', icon: '🚗' },
    { id: 'OPERACIONAL', name: 'Operacional', icon: '⚙️' },
    { id: 'PAINEL_TECNICO', name: 'Painel do Técnico', icon: '🔧' },
    { id: 'CONTRATOS', name: 'Contratos e Docs', icon: '📄' },
];

function Skeleton({ className }: { className?: string }) {
    return <div className={cn('animate-pulse rounded-2xl bg-white/[0.05]', className)} />;
}

/* ─── Dark Modal ─── */
function PlanModal({ open, onClose, plan, onSave }: {
    open: boolean; onClose: () => void; plan: any; onSave: (data: any) => void
}) {
    const [name, setName] = useState(plan?.name ?? '');
    const [price, setPrice] = useState(plan?.price?.toString() ?? '');
    const [mods, setMods] = useState<string[]>(plan?.modules ?? ['BASE']);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setName(plan?.name ?? '');
            setPrice(plan?.price?.toString() ?? '');
            setMods(plan?.modules ?? ['BASE']);
        }
    }, [open, plan]);

    const toggle = (id: string) => {
        if (id === 'BASE') return;
        setMods(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    const handleSave = async () => {
        if (!name || !price) return toast.error('Nome e preço são obrigatórios');
        setSaving(true);
        try {
            await onSave({ name, price: Number(price), modules: mods });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div
                className="relative w-full sm:max-w-lg sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden"
                style={{
                    background: '#10111a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
                }}
            >
                {/* Header glow */}
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {plan ? 'Editar Plano' : 'Novo Plano'}
                        </h2>
                        <p className="text-xs text-white/30 mt-0.5">Configure módulos e preço do pacote</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Fields */}
                <div className="px-6 space-y-4 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-1.5">Nome do Plano</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex: Master"
                                className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder-white/20 text-sm outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-1.5">Preço Monthly (R$)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder-white/20 text-sm outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">Módulos do Pacote</label>
                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                            {CONST_MODULES.map(mod => {
                                const active = mods.includes(mod.id);
                                const isBase = mod.id === 'BASE';
                                return (
                                    <button
                                        key={mod.id}
                                        type="button"
                                        onClick={() => toggle(mod.id)}
                                        disabled={isBase}
                                        className={cn(
                                            'relative p-3 rounded-xl border text-left flex items-center gap-2 transition-all duration-200',
                                            active
                                                ? 'border-indigo-500/40 bg-indigo-500/15 text-white'
                                                : 'border-white/[0.07] bg-white/[0.03] text-white/40 hover:border-white/10 hover:text-white/60',
                                            isBase && 'opacity-60 cursor-not-allowed'
                                        )}
                                    >
                                        <span className="text-base">{mod.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[11px] font-bold block truncate">{mod.name}</span>
                                        </div>
                                        {active && (
                                            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-3 border-t border-white/[0.06] flex gap-3">
                    <button onClick={onClose} className="flex-1 h-11 rounded-xl text-sm font-bold text-white/40 bg-white/[0.04] hover:bg-white/[0.07] transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 h-11 rounded-xl text-sm font-bold text-white transition-all hover:shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                        {saving ? 'Salvando...' : 'Salvar Plano'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Plans Page ─── */
export function Plans() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);

    const fetchPlans = async () => {
        try {
            const data = await getPlans();
            setPlans(data);
        } catch (err: any) {
            toast.error('Erro ao buscar planos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlans(); }, []);

    const handleOpenModal = (plan?: any) => {
        setEditingPlan(plan ?? null);
        setModalOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            if (editingPlan) {
                await updatePlan(editingPlan.id, data);
                toast.success('Plano atualizado');
            } else {
                await createPlan(data);
                toast.success('Plano criado');
            }
            fetchPlans();
        } catch (err: any) {
            toast.error(err.message);
            throw err;
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apagar este plano?')) return;
        try {
            await deletePlan(id);
            toast.success('Plano removido');
            fetchPlans();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // Color accent per plan index
    const ACCENTS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Planos & Pacotes</h1>
                    <p className="text-sm text-white/40 mt-1">{plans.length} pacote{plans.length !== 1 ? 's' : ''} configurado{plans.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.35)] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    Novo Plano
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
                </div>
            ) : plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-5">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-white/[0.04] border border-white/[0.06]">
                        <Package className="w-9 h-9 text-white/20" />
                    </div>
                    <div className="text-center">
                        <p className="text-white/60 font-semibold">Nenhum plano cadastrado</p>
                        <p className="text-white/30 text-sm mt-1">Crie planos para oferecer pacotes às suas empresas</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> Criar primeiro plano
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {plans.map((plan, idx) => {
                        const accent = ACCENTS[idx % ACCENTS.length];
                        return (
                            <div
                                key={plan.id}
                                className="relative rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02] flex flex-col gap-4 hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                            >
                                {/* BG glow */}
                                <div
                                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-15 blur-2xl"
                                    style={{ background: accent }}
                                />

                                {/* Top row */}
                                <div className="relative flex justify-between items-start">
                                    <div
                                        className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                                        style={{ background: `${accent}25`, boxShadow: `0 0 20px ${accent}30` }}
                                    >
                                        <Package className="w-5 h-5" style={{ color: accent }} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenModal(plan)}
                                            className="w-8 h-8 flex items-center justify-center rounded-xl text-white/30 hover:text-white hover:bg-white/[0.07] transition-all"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="relative">
                                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-2xl font-black text-white">R$ {plan.price.toFixed(2)}</span>
                                        <span className="text-xs font-medium text-white/30">/mês</span>
                                    </div>
                                </div>

                                {/* Modules */}
                                <div className="relative">
                                    <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-2">
                                        {plan.modules.length} módulo{plan.modules.length !== 1 ? 's' : ''}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {plan.modules.map((modId: string) => {
                                            const mod = CONST_MODULES.find(x => x.id === modId);
                                            return (
                                                <span
                                                    key={modId}
                                                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border"
                                                    style={{
                                                        backgroundColor: `${accent}15`,
                                                        borderColor: `${accent}25`,
                                                        color: accent,
                                                    }}
                                                >
                                                    <span>{mod?.icon}</span>
                                                    {mod?.name || modId}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <PlanModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                plan={editingPlan}
                onSave={handleSave}
            />
        </div>
    );
}
