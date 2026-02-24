import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Plus, Search, Activity, Users, CheckCircle2, XCircle, Shield, Clock } from 'lucide-react';
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

export function Dashboard() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const { data } = await api.get('/companies');
            setCompanies(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (lastSeenAt: string | null) => {
        if (!lastSeenAt) return 'OFFLINE';
        const lastSeen = new Date(lastSeenAt);
        const now = new Date();
        const diffHours = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);
        return diffHours <= 2 ? 'ONLINE' : 'OFFLINE';
    };

    const getTimeAgo = (dateStr: string | null) => {
        if (!dateStr) return 'Nunca';
        const date = new Date(dateStr);
        const now = new Date();
        const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diffSec < 60) return 'Agora';
        if (diffSec < 3600) return `${Math.floor(diffSec / 60)}min atrás`;
        if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h atrás`;
        return `${Math.floor(diffSec / 86400)}d atrás`;
    };

    const onlineCount = companies.filter(c => getStatus(c.lastSeenAt) === 'ONLINE').length;
    const offlineCount = companies.length - onlineCount;
    const activeLicenses = companies.filter(c => c.licenses?.length > 0).length;

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.document && c.document.includes(searchTerm))
    );

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        const confirmMsg = newStatus === 'SUSPENDED'
            ? 'Suspender a empresa por inadimplência bloqueará todo o acesso com base no heartbeat local. Deseja continuar?'
            : 'Desbloquear a empresa? O acesso será restaurado imediatamente.';

        if (!confirm(confirmMsg)) return;

        try {
            await api.put(`/companies/${id}`, { status: newStatus });
            toast.success(`Empresa ${newStatus === 'ACTIVE' ? 'DEDBLOQUEADA' : 'BLOQUEADA'} com sucesso!`);
            loadCompanies();
        } catch (error) {
            toast.error('Erro ao alterar status da empresa.');
        }
    };

    const stats = [
        { title: 'Total Empresas', value: companies.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        { title: 'Online Agora', value: onlineCount, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        { title: 'Offline', value: offlineCount, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
        { title: 'Licenças Ativas', value: activeLicenses, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    ];

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium text-gray-400">Carregando dados...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Toaster richColors position="top-right" toastOptions={{ duration: 4000 }} />
            <CompanyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadCompanies} />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Monitore e gerencie as instâncias ativas do NetControl.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nova Empresa</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`bg-white p-5 rounded-2xl shadow-sm border ${stat.border} flex items-center space-x-4 transition-all hover:shadow-md`}>
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Empresas Cadastradas</h2>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou CNPJ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-72 bg-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Empresa</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Documento</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Módulos</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Situação (Fin.)</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Conexão (App)</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Último Ping</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">Ação Rápida</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCompanies.map((company) => {
                                const isOnline = getStatus(company.lastSeenAt) === 'ONLINE';
                                const modules = company.licenses?.[0]?.modules || [];

                                return (
                                    <tr key={company.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                    {company.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-sm">{company.name}</div>
                                                    <div className="text-xs text-gray-400 font-mono">{company.id.substring(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                            {company.document || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                {modules.length > 0 ? modules.map((mod: string, i: number) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md border border-gray-200 uppercase tracking-wider">
                                                        {mod}
                                                    </span>
                                                )) : <span className="text-gray-300 text-xs italic">Nenhum</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {company.status === 'SUSPENDED' ? (
                                                <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                                                    Inadimplente (Bloqueada)
                                                </div>
                                            ) : company.status === 'ACTIVE' ? (
                                                <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                                                    Adimplente (Normal)
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                                                    Cancelada
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isOnline
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                {isOnline ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                <span>{isOnline ? 'Online' : 'Offline'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{getTimeAgo(company.lastSeenAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-3">
                                                {company.status === 'SUSPENDED' ? (
                                                    <button onClick={() => toggleStatus(company.id, company.status)} className="text-emerald-600 font-bold text-xs hover:text-emerald-700 hover:underline">
                                                        Desbloquear
                                                    </button>
                                                ) : (
                                                    <button onClick={() => toggleStatus(company.id, company.status)} className="text-red-600 font-bold text-xs hover:text-red-700 hover:underline">
                                                        Bloquear Acesso
                                                    </button>
                                                )}
                                                <a href={`/companies`} className="text-blue-600 font-semibold text-xs hover:text-blue-700 transition-colors hover:underline">
                                                    Gerenciar
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredCompanies.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                                <Users className="w-7 h-7 text-gray-300" />
                                            </div>
                                            <p className="text-base font-semibold text-gray-900">Nenhuma empresa encontrada</p>
                                            <p className="text-sm text-gray-400 mt-1">Cadastre a primeira empresa para começar.</p>
                                            <button
                                                onClick={() => setModalOpen(true)}
                                                className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>Cadastrar Empresa</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
