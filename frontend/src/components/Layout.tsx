import { useState } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
    LayoutDashboard, Users, Settings, LogOut,
    ChevronLeft, ChevronRight, Menu, X, Package, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Empresas', path: '/companies' },
    { icon: Package, label: 'Planos', path: '/plans' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
];

/* ─── Sidebar ─── */
interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    currentPath: string;
    email: string;
    onLogout: () => void;
}

function Sidebar({ collapsed, onToggle, currentPath, email, onLogout }: SidebarProps) {
    const initial = email ? email.charAt(0).toUpperCase() : 'A';

    return (
        <aside
            className={cn(
                'hidden md:flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out',
                'border-r border-white/[0.06] bg-[#0a0b10]',
                collapsed ? 'w-[72px]' : 'w-[240px]'
            )}
        >
            {/* Brand */}
            <div className={cn(
                'flex items-center h-16 px-4 shrink-0 border-b border-white/[0.06]',
                collapsed ? 'justify-center' : 'gap-3'
            )}>
                <div
                    className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                {!collapsed && (
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white leading-tight tracking-tight truncate">NetControl</p>
                        <p className="text-[10px] text-white/40 font-medium tracking-widest uppercase">Hub</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
                    const active = currentPath === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            title={collapsed ? label : undefined}
                            className={cn(
                                'group relative flex items-center rounded-xl transition-all duration-200 h-10',
                                collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                                active
                                    ? 'bg-indigo-500/15 text-indigo-400'
                                    : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                            )}
                        >
                            {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-400" />
                            )}
                            <Icon
                                className="w-[18px] h-[18px] shrink-0"
                                strokeWidth={active ? 2.5 : 1.8}
                            />
                            {!collapsed && (
                                <span className="text-sm font-medium truncate flex-1">{label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/[0.06]" />

            {/* User + Footer */}
            <div className={cn('p-3 space-y-2', collapsed ? 'items-center' : '')}>
                {!collapsed && (
                    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl cursor-default">
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white/80 truncate leading-tight">{email || 'admin'}</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-wider">Admin Master</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={onLogout}
                    title="Sair"
                    className={cn(
                        'w-full flex items-center gap-2 rounded-xl h-9 px-2 text-xs font-medium',
                        'text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200',
                        collapsed ? 'justify-center' : ''
                    )}
                >
                    <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                    {!collapsed && <span>Sair</span>}
                </button>

                <div className="border-t border-white/[0.06]" />

                <button
                    onClick={onToggle}
                    className={cn(
                        'w-full flex items-center gap-2 rounded-xl h-8 px-2 text-[10px] font-medium uppercase tracking-widest',
                        'text-white/20 hover:text-white/60 hover:bg-white/5 transition-all',
                        collapsed ? 'justify-center' : ''
                    )}
                >
                    {collapsed
                        ? <ChevronRight className="w-3.5 h-3.5" />
                        : <><ChevronLeft className="w-3.5 h-3.5" /><span>Recolher</span></>
                    }
                </button>
            </div>
        </aside>
    );
}

/* ─── Mobile Bottom Nav ─── */
function BottomNav({ currentPath }: { currentPath: string }) {
    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-white/[0.06] bg-[#0a0b10]/95 backdrop-blur-xl"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)' }}
        >
            {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
                const active = currentPath === path;
                return (
                    <Link
                        key={path}
                        to={path}
                        className={cn(
                            'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 relative transition-all duration-200',
                            active ? 'text-indigo-400' : 'text-white/30'
                        )}
                    >
                        {active && (
                            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-indigo-400" />
                        )}
                        <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
                        <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

/* ─── Layout Root ─── */
export function Layout() {
    const { token, admin, logout } = useAuthStore();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

    const email = admin?.email ?? '';
    const currentItem = NAV_ITEMS.find(n => n.path === location.pathname) ?? NAV_ITEMS[0];

    return (
        <div className="flex h-screen overflow-hidden bg-[#070911]">
            {/* Desktop Sidebar */}
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(c => !c)}
                currentPath={location.pathname}
                email={email}
                onLogout={logout}
            />

            {/* Mobile Drawer Overlay */}
            {drawerOpen && (
                <>
                    <div
                        className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div
                        className="md:hidden fixed inset-y-0 left-0 z-50 w-64 shadow-2xl"
                        style={{ animation: 'slideInFromLeft 0.25s cubic-bezier(0.16,1,0.3,1)' }}
                    >
                        <Sidebar
                            collapsed={false}
                            onToggle={() => setDrawerOpen(false)}
                            currentPath={location.pathname}
                            email={email}
                            onLogout={() => { logout(); setDrawerOpen(false); }}
                        />
                    </div>
                </>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 shrink-0 border-b border-white/[0.06] bg-[#0a0b10]/95 backdrop-blur-xl">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-bold text-white">NetControl</span>
                        <span className="text-white/20 text-xs">·</span>
                        <span className="text-xs text-white/40 font-medium">{currentItem.label}</span>
                    </div>
                    <button
                        onClick={() => setDrawerOpen(d => !d)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                    >
                        {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </header>

                {/* Desktop Top Bar */}
                <header className="hidden md:flex items-center justify-between px-8 h-14 shrink-0 border-b border-white/[0.06] bg-[#0a0b10]/80 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-white/80">{currentItem.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black cursor-pointer hover:scale-105 transition-transform"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            {email ? email.charAt(0).toUpperCase() : 'A'}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main
                    className="flex-1 overflow-y-auto"
                    style={{
                        paddingBottom: 'calc(var(--bottom-nav-h, 64px) + env(safe-area-inset-bottom, 0px))',
                        background: 'radial-gradient(ellipse at top, #0f1020 0%, #070911 50%)'
                    }}
                >
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            <BottomNav currentPath={location.pathname} />
        </div>
    );
}
