import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Mail, User, Lock, KeyRound, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AdminData {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
}

/* ─── Skeleton ─── */
function AdminSkeleton() {
    return (
        <Card className="mb-3">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-48" />
                </div>
                <div className="skeleton w-8 h-8 rounded-lg" />
                <div className="skeleton w-8 h-8 rounded-lg" />
            </CardContent>
        </Card>
    );
}

/* ─── Admin Modal ─── */
interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    admin?: AdminData | null;
    onSaved: () => void;
}

function AdminModal({ isOpen, onClose, admin, onSaved }: AdminModalProps) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (admin) {
                setFormData({ name: admin.name || '', email: admin.email || '', password: '' });
            } else {
                setFormData({ name: '', email: '', password: '' });
            }
        }
    }, [isOpen, admin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (admin) {
                // Edit
                await updateAdmin(admin.id, formData);
                toast.success('Administrador atualizado com sucesso!');
            } else {
                // Create
                await createAdmin(formData);
                toast.success('Administrador criado com sucesso!');
            }
            onSaved();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Erro ao processar requisição');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-md p-0">
                <div className="px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
                    <DialogHeader>
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 bg-foreground rounded-xl">
                                <Shield className="w-5 h-5 text-background" strokeWidth={2} />
                            </div>
                            <div>
                                <DialogTitle className="text-lg">
                                    {admin ? 'Editar Administrador' : 'Novo Administrador'}
                                </DialogTitle>
                                <DialogDescription className="text-[11px] uppercase tracking-widest mt-0.5">
                                    Controle de Acesso
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="admin-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <User className="w-3.5 h-3.5" /> Nome (Opcional)
                        </Label>
                        <Input
                            id="admin-name"
                            placeholder="Ex: Matheus"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> E-mail
                        </Label>
                        <Input
                            id="admin-email"
                            type="email"
                            required
                            placeholder="admin@netcontrol.com.br"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="admin-pass" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" /> {admin ? 'Nova Senha (Opcional)' : 'Senha'}
                        </Label>
                        <Input
                            id="admin-pass"
                            type="password"
                            required={!admin}
                            placeholder={admin ? 'Deixe em branco para manter' : '••••••••'}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </form>

                <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={loading} className="gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" strokeWidth={2} />}
                        {admin ? 'Salvar' : 'Criar Conta'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ─── Page ─── */
export function Admins() {
    const currentAdmin = useAuthStore(s => s.admin);
    const [admins, setAdmins] = useState<AdminData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminData | null>(null);

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const data = await getAdmins();
            setAdmins(data);
        } catch {
            toast.error('Erro ao listar administradores.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
    }, []);

    const handleDelete = async (id: string) => {
        if (id === currentAdmin?.id) {
            toast.error('Você não pode se excluir.');
            return;
        }
        if (confirm('Tem certeza que deseja remover este administrador? O acesso será revogado imediatamente.')) {
            try {
                await deleteAdmin(id);
                toast.success('Administrador removido.');
                loadAdmins();
            } catch (err: any) {
                toast.error(err.response?.data?.error || 'Erro ao excluir');
            }
        }
    };

    const filteredAdmins = admins.filter(a =>
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        (a.name && a.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mb-1 mt-0.5">Control Plane</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                        <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-foreground" strokeWidth={2.5} />
                        Administradores
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Gerencie quem tem acesso ao Hub.</p>
                </div>
                <Button onClick={() => { setSelectedAdmin(null); setIsModalOpen(true); }} className="gap-2 shrink-0 rounded-full h-10 px-5">
                    <Plus className="w-4 h-4" strokeWidth={2.5} /> Novo Admin
                </Button>
            </div>

            {/* ── Tools ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por e-mail ou nome..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-border bg-background shadow-sm w-full"
                    />
                </div>
            </div>

            {/* ── List ── */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <AdminSkeleton key={i} />)}
                </div>
            ) : filteredAdmins.length === 0 ? (
                <Card className="border border-dashed bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-xl bg-background border flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-bold text-foreground">Nenhum registro encontrado</p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Não encontramos nenhum administrador com o termo buscado.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAdmins.map(admin => {
                        const isMe = admin.id === currentAdmin?.id;
                        const fallback = (admin.name && admin.name.trim().length > 0) ? admin.name.charAt(0).toUpperCase() : admin.email.charAt(0).toUpperCase();

                        return (
                            <Card key={admin.id} className={cn('overflow-hidden transition-all hover:shadow-md border', isMe && 'border-foreground/30 shadow-sm')}>
                                <CardContent className="p-0">
                                    <div className="p-5 flex items-start gap-4">
                                        <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                                            <AvatarFallback className="text-lg font-bold bg-foreground text-background">
                                                {fallback}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-foreground truncate">{admin.name || 'Sem Nome'}</p>
                                                {isMe && <span className="text-[9px] bg-foreground text-background font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">Você</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">{admin.email}</p>
                                        </div>
                                    </div>
                                    <div className="px-5 py-3 bg-muted/40 border-t border-border flex items-center justify-between">
                                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                                            Criado em {new Date(admin.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" title="Editar" onClick={() => { setSelectedAdmin(admin); setIsModalOpen(true); }}>
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                            {!isMe && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50" title="Excluir" onClick={() => handleDelete(admin.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                admin={selectedAdmin}
                onSaved={loadAdmins}
            />
        </div>
    );
}
