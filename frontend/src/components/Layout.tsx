import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';

export function Layout() {
    const { token, admin, logout } = useAuthStore();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Empresas', path: '/companies' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col border-r border-gray-800 shadow-2xl">
                <div className="p-6 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="font-bold text-xl">NH</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">NetControl</h1>
                        <p className="text-xs text-blue-400 font-medium">Control Plane</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800 bg-gray-900/50 mt-auto">
                    <div className="flex items-center space-x-3 mb-4 px-2">
                        <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                            {admin?.email ? admin.email.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate" title={admin?.email}>{admin?.email || 'admin@admin.com'}</p>
                            <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-0.5">Admin Master</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-800 hover:bg-red-500/10 text-gray-300 hover:text-red-400 border border-gray-700 hover:border-red-500/30 rounded-xl transition-all text-sm font-bold group"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Encerrar Sessão</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                <div className="max-w-7xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
