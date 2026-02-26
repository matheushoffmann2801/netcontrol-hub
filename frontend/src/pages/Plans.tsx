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
    return <div className={cn('animate-pulse rounded-2xl bg-muted', className)} />;
}

/* ─── Plan Modal (mobile-first bottom-sheet / desktop centered) ─── */
function PlanModal({ open, onClose, plan, onSave }: {
    open: boolean; onClose: () => void; plan: any; onSave: (data: any) => void
}) {
    const [name, setName] = useState(plan?.name ?? '');
    const [price, setPrice] = useState(plan?.price?.toString() ?? '');
    const [mods, setMods] = useState<string[]>(plan?.modules ?? ['BASE']);
    const [saving, setSaving] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            setName(plan?.name ?? '');
            setPrice(plan?.price?.toString() ?? '');
            setMods(plan?.modules ?? ['BASE']);
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
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

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 200);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className={cn(
                    'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
                    visible ? 'opacity-100' : 'opacity-0'
                )}
                onClick={handleClose}
            />
            {/* Modal panel */}
            <div
                className={cn(
                    'relative w-full sm:max-w-lg sm:mx-4 rounded-t-3xl sm:rounded-2xl overflow-hidden bg-background border border-border shadow-2xl transition-all duration-300',
                    visible
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-8 sm:translate-y-4 opacity-0',
                    'max-h-[90dvh] flex flex-col'
                )}
            >
                {/* Accent line */}
                <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                {/* Drag indicator (mobile) */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 pt-3 sm:pt-5 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">
                            {plan ? 'Editar Plano' : 'Novo Plano'}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Configure módulos e preço do pacote</p>
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 sm:px-6 space-y-4 pb-4">
                    {/* Fields */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Nome do Plano</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex: Master"
                                className="w-full h-11 px-4 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground/40 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Preço Mensal (R$)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                className="w-full h-11 px-4 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground/40 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>

                    {/* Modules */}
                    <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Módulos do Pacote</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                                            'relative p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all duration-200',
                                            active
                                                ? 'border-primary/40 bg-primary/5 text-foreground shadow-sm'
                                                : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/20 hover:text-foreground',
                                            isBase && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <span className="text-base">{mod.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[11px] font-bold block truncate">{mod.name}</span>
                                        </div>
                                        {active && (
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 border-t border-border flex gap-3 shrink-0">
                    <button onClick={handleClose} className="flex-1 h-11 rounded-xl text-sm font-bold text-muted-foreground bg-muted/50 hover:bg-muted transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 h-11 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
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

    const ACCENTS = [
        { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-600', dot: 'bg-blue-500' },
        { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-600', dot: 'bg-amber-500' },
        { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-600', dot: 'bg-rose-500' },
        { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-600', dot: 'bg-violet-500' },
    ];

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Planos & Pacotes</h1>
                    <p className="text-sm text-muted-foreground mt-1">{plans.length} pacote{plans.length !== 1 ? 's' : ''} configurado{plans.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-primary-foreground bg-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    Novo Plano
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
                </div>
            ) : plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-5">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-muted border border-border">
                        <Package className="w-9 h-9 text-muted-foreground/40" />
                    </div>
                    <div className="text-center">
                        <p className="text-foreground/70 font-semibold">Nenhum plano cadastrado</p>
                        <p className="text-muted-foreground text-sm mt-1">Crie planos para oferecer pacotes às suas empresas</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> Criar primeiro plano
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {plans.map((plan, idx) => {
                        const accent = ACCENTS[idx % ACCENTS.length];
                        return (
                            <div
                                key={plan.id}
                                className="relative rounded-2xl p-5 border border-border bg-card flex flex-col gap-4 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                            >
                                {/* BG glow */}
                                <div className={cn('absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30 blur-2xl', accent.dot)} />

                                {/* Top row */}
                                <div className="relative flex justify-between items-start">
                                    <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center', accent.bg)}>
                                        <Package className={cn('w-5 h-5', accent.text)} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenModal(plan)}
                                            className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="relative">
                                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-2xl font-black text-foreground">R$ {plan.price.toFixed(2)}</span>
                                        <span className="text-xs font-medium text-muted-foreground">/mês</span>
                                    </div>
                                </div>

                                {/* Modules */}
                                <div className="relative">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                        {plan.modules.length} módulo{plan.modules.length !== 1 ? 's' : ''}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {plan.modules.map((modId: string) => {
                                            const mod = CONST_MODULES.find(x => x.id === modId);
                                            return (
                                                <span
                                                    key={modId}
                                                    className={cn(
                                                        'flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border',
                                                        accent.bg, accent.border, accent.text
                                                    )}
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
