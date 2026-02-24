import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Shield, Key, Bell, Globe, Server, Save, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export function Settings() {
    const { admin } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        hubName: 'NetControl Hub',
        hubUrl: 'https://hub.netcontrol.com.br',
        heartbeatInterval: '60',
        licenseValidity: '30',
        autoRenew: false,
        emailNotifications: true,
        offlineThreshold: '2',
    });

    const handleChange = (field: string, value: string | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Simula salvar (por agora, apenas localStorage)
        await new Promise(r => setTimeout(r, 800));
        localStorage.setItem('hub_settings', JSON.stringify(settings));
        toast.success('Configurações salvas com sucesso!');
        setSaving(false);
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <Toaster richColors position="top-right" />

            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configurações</h1>
                <p className="text-gray-500 mt-1">Configure o comportamento global do NetControl Hub.</p>
            </div>

            {/* Admin Info */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                        {admin?.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Admin Master</h2>
                        <p className="text-sm text-gray-500">{admin?.email}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Acesso total ao Control Plane</span>
                </div>
            </div>

            {/* Hub Config */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center space-x-2">
                        <Server className="w-4 h-4 text-gray-500" />
                        <h3 className="font-bold text-gray-900">Configurações do Hub</h3>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome do Hub</label>
                            <input
                                value={settings.hubName}
                                onChange={e => handleChange('hubName', e.target.value)}
                                className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">URL em Produção</label>
                            <input
                                value={settings.hubUrl}
                                onChange={e => handleChange('hubUrl', e.target.value)}
                                className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* License Config */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4 text-gray-500" />
                        <h3 className="font-bold text-gray-900">Licenciamento</h3>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Validade padrão (dias)</label>
                            <input
                                type="number"
                                value={settings.licenseValidity}
                                onChange={e => handleChange('licenseValidity', e.target.value)}
                                className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Intervalo Heartbeat (min)</label>
                            <input
                                type="number"
                                value={settings.heartbeatInterval}
                                onChange={e => handleChange('heartbeatInterval', e.target.value)}
                                className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Threshold Offline (horas)</label>
                            <input
                                type="number"
                                value={settings.offlineThreshold}
                                onChange={e => handleChange('offlineThreshold', e.target.value)}
                                className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Config */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <h3 className="font-bold text-gray-900">Notificações</h3>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">Notificações por E-mail</p>
                            <p className="text-xs text-gray-400 mt-0.5">Receber alertas quando uma empresa ficar offline por muito tempo.</p>
                        </div>
                        <button
                            onClick={() => handleChange('emailNotifications', !settings.emailNotifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">Renovação Automática</p>
                            <p className="text-xs text-gray-400 mt-0.5">Renovar automaticamente licenças próximas ao vencimento.</p>
                        </div>
                        <button
                            onClick={() => handleChange('autoRenew', !settings.autoRenew)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoRenew ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${settings.autoRenew ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* API Info */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <h3 className="font-bold text-gray-900">API & Endpoints</h3>
                    </div>
                </div>
                <div className="p-6">
                    <div className="space-y-3">
                        {[
                            { method: 'POST', path: '/auth/login', desc: 'Autenticação do Admin' },
                            { method: 'GET', path: '/companies', desc: 'Listar todas as empresas' },
                            { method: 'POST', path: '/companies', desc: 'Registrar nova empresa + licença' },
                            { method: 'PUT', path: '/companies/:id', desc: 'Atualizar empresa' },
                            { method: 'DELETE', path: '/companies/:id', desc: 'Remover empresa' },
                            { method: 'POST', path: '/companies/:id/renew', desc: 'Renovar licença' },
                            { method: 'POST', path: '/heartbeat', desc: 'Heartbeat do sistema local' },
                        ].map((endpoint, i) => (
                            <div key={i} className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${endpoint.method === 'GET' ? 'bg-emerald-100 text-emerald-700' :
                                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                                            endpoint.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                    }`}>{endpoint.method}</span>
                                <code className="text-xs font-mono text-gray-600">{endpoint.path}</code>
                                <span className="text-xs text-gray-400 ml-auto">{endpoint.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pb-6">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
                </button>
            </div>
        </div>
    );
}
