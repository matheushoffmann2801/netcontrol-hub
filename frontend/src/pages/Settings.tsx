import { useState } from 'react';
import { useAuthStore, getFirstName } from '../store/useAuthStore';
import {
    Shield, Key, Bell, Globe, Server, Save, Loader2,
    User, Mail, Camera, CheckCircle2, Lock
} from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/* ─── Toggle Switch ─── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            onClick={onChange}
            role="switch"
            aria-checked={checked}
            className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                checked ? 'bg-foreground' : 'bg-muted-foreground/30'
            )}
        >
            <span className={cn('inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm', checked ? 'translate-x-6' : 'translate-x-1')} />
        </button>
    );
}

/* ─── Section Card ─── */
function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="pb-3 border-b border-border bg-muted/20 rounded-t-2xl px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">{children}</CardContent>
        </Card>
    );
}

import React from 'react';

export function Settings() {
    const { admin, setDisplayName, logout } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // Profile state
    const [profileName, setProfileName] = useState(admin?.name ?? '');
    const [profileEmail] = useState(admin?.email ?? '');
    const [profilePassword, setProfilePassword] = useState('');

    // Hub settings
    const [settings, setSettings] = useState({
        hubName: 'NetControl Hub',
        hubUrl: 'https://hub.netcontrol.com.br',
        heartbeatInterval: '60',
        licenseValidity: '30',
        autoRenew: false,
        emailNotifications: true,
        offlineThreshold: '2',
    });

    const initial = getFirstName(admin).charAt(0).toUpperCase();

    const handleSaveProfile = async () => {
        if (!admin?.id) return;
        setSavingProfile(true);
        try {
            const dataToUpdate: any = { name: profileName };
            if (profilePassword.trim()) {
                dataToUpdate.password = profilePassword;
            }
            await api.put(`/admins/${admin.id}`, dataToUpdate);
            setDisplayName(profileName);
            toast.success('Perfil atualizado com sucesso!');
            setProfilePassword(''); // clears the field after saving
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Erro ao atualizar perfil.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        localStorage.setItem('hub_settings', JSON.stringify(settings));
        toast.success('Configurações salvas!');
        setSaving(false);
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Configurações</h1>
                <p className="text-muted-foreground text-sm mt-1">Gerencie seu perfil e as configurações do Hub.</p>
            </div>

            {/* ── PERFIL ── */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-0 border-b border-border bg-muted/20 rounded-t-2xl px-6 py-4">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold">
                        <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                        Meu Perfil
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Avatar + name header */}
                    <div className="flex items-center gap-5">
                        <div className="relative group cursor-pointer">
                            <Avatar className="w-18 h-18 border-2 border-border" style={{ width: 72, height: 72 }}>
                                <AvatarFallback
                                    className="text-2xl font-black text-background"
                                    style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #374151 100%)' }}
                                >
                                    {initial}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-foreground">{getFirstName(admin)}</p>
                            <p className="text-sm text-muted-foreground">{profileEmail}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <Shield className="w-3 h-3 text-emerald-600" />
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Admin Master · Acesso Total</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Editable fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="profile-name" className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                Nome de Exibição
                            </Label>
                            <Input
                                id="profile-name"
                                placeholder="Seu nome"
                                value={profileName}
                                onChange={e => setProfileName(e.target.value)}
                            />
                            <p className="text-[11px] text-muted-foreground">Este é o nome mostrado na saudação do Dashboard.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-email" className="flex items-center gap-1.5 border-t border-border mt-2 pt-4 sm:border-t-0 sm:mt-0 sm:pt-0">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                E-mail
                            </Label>
                            <Input
                                id="profile-email"
                                value={profileEmail}
                                disabled
                                className="opacity-60 cursor-not-allowed"
                            />
                            <p className="text-[11px] text-muted-foreground">E-mail não pode ser alterado aqui.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-password" className="flex items-center gap-1.5">
                                <Key className="w-3.5 h-3.5 text-muted-foreground" />
                                Nova Senha
                            </Label>
                            <Input
                                id="profile-password"
                                type="password"
                                placeholder="Deixe em branco para manter"
                                value={profilePassword}
                                onChange={e => setProfilePassword(e.target.value)}
                            />
                            <p className="text-[11px] text-muted-foreground">Preencha apenas se quiser mudar sua senha.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Button variant="ghost" size="sm" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2">
                            <Lock className="w-3.5 h-3.5" />
                            Sair da conta
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={savingProfile} size="sm" className="gap-2">
                            {savingProfile
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <CheckCircle2 className="w-3.5 h-3.5" />
                            }
                            {savingProfile ? 'Salvando...' : 'Salvar Perfil'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── HUB CONFIG ── */}
            <SectionCard icon={Server} title="Configurações do Hub">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="hub-name">Nome do Hub</Label>
                        <Input id="hub-name" value={settings.hubName} onChange={e => setSettings(s => ({ ...s, hubName: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hub-url">URL em Produção</Label>
                        <Input id="hub-url" value={settings.hubUrl} onChange={e => setSettings(s => ({ ...s, hubUrl: e.target.value }))} />
                    </div>
                </div>
            </SectionCard>

            {/* ── LICENCIAMENTO ── */}
            <SectionCard icon={Key} title="Licenciamento">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-2">
                        <Label>Validade padrão (dias)</Label>
                        <Input type="number" value={settings.licenseValidity} onChange={e => setSettings(s => ({ ...s, licenseValidity: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Heartbeat (min)</Label>
                        <Input type="number" value={settings.heartbeatInterval} onChange={e => setSettings(s => ({ ...s, heartbeatInterval: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Threshold Offline (h)</Label>
                        <Input type="number" value={settings.offlineThreshold} onChange={e => setSettings(s => ({ ...s, offlineThreshold: e.target.value }))} />
                    </div>
                </div>
            </SectionCard>

            {/* ── NOTIFICAÇÕES ── */}
            <SectionCard icon={Bell} title="Notificações">
                <div className="space-y-5">
                    {[
                        { key: 'emailNotifications', label: 'Notificações por E-mail', desc: 'Alertas quando uma empresa ficar offline.' },
                        { key: 'autoRenew', label: 'Renovação Automática', desc: 'Renovar licenças próximas ao vencimento.' },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground">{label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                            </div>
                            <Toggle
                                checked={settings[key as keyof typeof settings] as boolean}
                                onChange={() => setSettings(s => ({ ...s, [key]: !s[key as keyof typeof settings] }))}
                            />
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* ── API Endpoints ── */}
            <SectionCard icon={Globe} title="API & Endpoints">
                <div className="space-y-1.5">
                    {[
                        { method: 'POST', path: '/auth/login', desc: 'Autenticação do Admin' },
                        { method: 'GET', path: '/companies', desc: 'Listar todas as empresas' },
                        { method: 'POST', path: '/companies', desc: 'Registrar nova empresa + licença' },
                        { method: 'PUT', path: '/companies/:id', desc: 'Atualizar empresa' },
                        { method: 'DELETE', path: '/companies/:id', desc: 'Remover empresa' },
                        { method: 'POST', path: '/companies/:id/renew', desc: 'Renovar licença' },
                        { method: 'POST', path: '/heartbeat', desc: 'Heartbeat do sistema local' },
                    ].map((ep, i) => {
                        const color = { GET: 'bg-emerald-100 text-emerald-700', POST: 'bg-blue-100 text-blue-700', PUT: 'bg-amber-100 text-amber-700', DELETE: 'bg-red-100 text-red-700' }[ep.method] ?? 'bg-muted text-muted-foreground';
                        return (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors">
                                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded font-mono shrink-0', color)}>{ep.method}</span>
                                <code className="text-xs font-mono text-foreground flex-1">{ep.path}</code>
                                <span className="text-xs text-muted-foreground hidden sm:block">{ep.desc}</span>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* Save */}
            <div className="flex justify-end pb-6">
                <Button onClick={handleSave} disabled={saving} className="gap-2 px-6">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
            </div>
        </div>
    );
}
