import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthStore, getFirstName } from '../store/useAuthStore';
import {
    LayoutDashboard, Users, Settings, LogOut,
<<<<<<< HEAD
    ChevronLeft, ChevronRight, Menu, X, Package, Zap
=======
    ChevronLeft, ChevronRight, Menu, X, Bell, UserCircle, Loader2, Shield
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
} from 'lucide-react';
import { api } from '../services/api'; // NEW
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
<<<<<<< HEAD
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Empresas', path: '/companies' },
    { icon: Package, label: 'Planos', path: '/plans' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
];

/* ─── Sidebar ─── */
=======
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', badge: null },
    { icon: Users, label: 'Empresas', path: '/companies', badge: null },
    { icon: Shield, label: 'Acessos', path: '/admins', badge: null },
    { icon: Settings, label: 'Configurações', path: '/settings', badge: null },
];

/* ─── Avatar button helper ─── */
function UserAvatar({ initial, size = 'md' }: { initial: string; size?: 'sm' | 'md' }) {
    return (
        <Avatar className={size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'}>
            <AvatarFallback className={cn('font-bold text-background', size === 'sm' ? 'text-[10px]' : 'text-xs')} style={{ background: 'hsl(222.2 47.4% 11.2%)' }}>
                {initial}
            </AvatarFallback>
        </Avatar>
    );
}

/* ─── Desktop Sidebar ─── */
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    currentPath: string;
    initial: string;
    displayName: string;
    onLogout: () => void;
    className?: string;
}

function Sidebar({ collapsed, onToggle, currentPath, initial, displayName, onLogout, className }: SidebarProps) {
    return (
<<<<<<< HEAD
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
=======
        <TooltipProvider delayDuration={0}>
            <aside className={cn(
                'flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out border-r border-border bg-background',
                collapsed ? 'w-[68px]' : 'w-[228px]',
                className
            )}>
                {/* Brand */}
                <div className={cn('flex items-center h-16 px-3.5 shrink-0 border-b border-border gap-2.5', collapsed && 'justify-center')}>
                    <div className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center font-black text-[12px] text-white shadow-md select-none" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #374151 100%)' }}>
                        NC
                    </div>
                    {!collapsed && (
                        <div className="min-w-0 flex-1 leading-tight">
                            <p className="text-sm font-bold text-foreground truncate">NetControl</p>
                            <p className="text-[9px] text-muted-foreground font-semibold tracking-widest uppercase">Control Plane</p>
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
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

<<<<<<< HEAD
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
=======
                {/* Nav items */}
                <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => {
                        const active = currentPath === path || (path !== '/' && currentPath.startsWith(path));
                        const item = (
                            <Link key={path} to={path} className={cn(
                                'group relative flex items-center rounded-xl transition-all duration-200 h-10',
                                collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                                active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}>
                                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2.5 : 1.8} />
                                {!collapsed && (
                                    <>
                                        <span className="text-sm font-medium truncate flex-1">{label}</span>
                                        {badge && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{badge}</Badge>}
                                    </>
                                )}
                            </Link>
                        );
                        if (collapsed) {
                            return (
                                <Tooltip key={path}>
                                    <TooltipTrigger asChild>{item}</TooltipTrigger>
                                    <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
                                </Tooltip>
                            );
                        }
                        return item;
                    })}
                </nav>

                <Separator />

                {/* Bottom: user row + actions */}
                <div className="p-2.5 space-y-1">
                    {/* User info (only when expanded) */}
                    {!collapsed && (
                        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-muted/60 transition-colors cursor-default group">
                            <UserAvatar initial={initial} size="sm" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Administrador</p>
                            </div>
                            <UserCircle className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                        </div>
                    )}

                    {/* Logout */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={onLogout}
                                className={cn(
                                    'w-full flex items-center gap-2 rounded-xl h-9 px-2.5 text-xs font-medium text-muted-foreground',
                                    'hover:text-red-500 hover:bg-red-50 transition-all duration-200',
                                    collapsed && 'justify-center'
                                )}
                            >
                                <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                                {!collapsed && <span>Sair</span>}
                            </button>
                        </TooltipTrigger>
                        {collapsed && <TooltipContent side="right">Sair</TooltipContent>}
                    </Tooltip>

                    <Separator />

                    {/* Collapse toggle */}
                    <button
                        onClick={onToggle}
                        className={cn(
                            'w-full flex items-center gap-2 rounded-xl h-8 px-2.5 text-[10px] font-semibold uppercase tracking-widest',
                            'text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all',
                            collapsed && 'justify-center'
                        )}
                    >
                        {collapsed
                            ? <ChevronRight className="w-3.5 h-3.5" />
                            : <><ChevronLeft className="w-3.5 h-3.5" /><span>Recolher</span></>}
                    </button>
                </div>
            </aside>
        </TooltipProvider>
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
    );
}

/* ─── Mobile Bottom Nav ─── */
function BottomNav({ currentPath }: { currentPath: string }) {
    return (
        <nav
<<<<<<< HEAD
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-white/[0.06] bg-[#0a0b10]/95 backdrop-blur-xl"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)' }}
=======
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-border bg-background/95 backdrop-blur-xl"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
        >
            {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
                const active = currentPath === path || (path !== '/' && currentPath.startsWith(path));
                return (
<<<<<<< HEAD
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
=======
                    <Link key={path} to={path} className={cn(
                        'flex-1 flex flex-col items-center justify-center gap-1 pt-3 pb-2 relative transition-all duration-200',
                        active ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                        {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-foreground" />}
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
                        <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{label.split(' ')[0]}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

<<<<<<< HEAD
=======
/* ─── Mobile Header ─── */
interface MobileHeaderProps {
    drawerOpen: boolean;
    onToggleDrawer: () => void;
    currentLabel: string;
    initial: string;
}

function MobileHeader({ drawerOpen, onToggleDrawer, currentLabel, initial }: MobileHeaderProps) {
    return (
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 shrink-0 border-b border-border bg-background/95 backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] text-white select-none" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #374151 100%)' }}>
                    NC
                </div>
                <span className="text-sm font-bold text-foreground">NetControl</span>
                <span className="text-muted-foreground/30 text-sm">·</span>
                <span className="text-xs text-muted-foreground font-medium">{currentLabel}</span>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bell className="w-4 h-4" />
                </Button>
                <button
                    onClick={onToggleDrawer}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                    {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <UserAvatar initial={initial} size="sm" />
            </div>
        </header>
    );
}

>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
/* ─── Layout Root ─── */
export function Layout() {
    const { token, admin, logout, login } = useAuthStore();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [verifying, setVerifying] = useState(!!token);

    // Valida o token contra o backend
    useEffect(() => {
        if (!token) return;
        api.get('/auth/me')
            .then(res => {
                // Atualiza os dados do admin caso tenham mudado
                login(token, res.data);
                setVerifying(false);
            })
            .catch(() => {
                logout();
                setVerifying(false);
            });
    }, [token, logout, login]);

    if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

    if (verifying) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/30" />
            </div>
        );
    }

    const firstName = getFirstName(admin);
    const initial = firstName.charAt(0).toUpperCase();
    const currentItem = NAV_ITEMS.find(n => n.path === location.pathname || (n.path !== '/' && location.pathname.startsWith(n.path))) ?? NAV_ITEMS[0];

    return (
        <div className="flex h-screen overflow-hidden bg-[#070911]">
            {/* Desktop Sidebar */}
            <Sidebar
                className="hidden md:flex"
                collapsed={collapsed}
                onToggle={() => setCollapsed(c => !c)}
                currentPath={location.pathname}
                initial={initial}
                displayName={firstName}
                onLogout={logout}
            />

            {/* Mobile Drawer Overlay */}
            {drawerOpen && (
                <>
<<<<<<< HEAD
                    <div
                        className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div
                        className="md:hidden fixed inset-y-0 left-0 z-50 w-64 shadow-2xl"
                        style={{ animation: 'slideInFromLeft 0.25s cubic-bezier(0.16,1,0.3,1)' }}
                    >
=======
                    <div className="md:hidden fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                    <div className="md:hidden fixed inset-y-0 left-0 z-50 w-64 shadow-2xl bg-background border-r border-border">
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
                        <Sidebar
                            collapsed={false}
                            onToggle={() => setDrawerOpen(false)}
                            currentPath={location.pathname}
                            initial={initial}
                            displayName={firstName}
                            onLogout={() => { logout(); setDrawerOpen(false); }}
                        />
                    </div>
                </>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
<<<<<<< HEAD
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
=======
                <MobileHeader
                    drawerOpen={drawerOpen}
                    onToggleDrawer={() => setDrawerOpen(d => !d)}
                    currentLabel={currentItem.label}
                    initial={initial}
                />

                {/* Desktop top bar */}
                <header className="hidden md:flex items-center justify-between px-6 h-14 shrink-0 border-b border-border bg-background">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground/50 text-xs">NetControl</span>
                        <span className="text-muted-foreground/30">/</span>
                        <span className="font-semibold text-foreground text-sm">{currentItem.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Bell className="w-4 h-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-5" />
                        <div className="flex items-center gap-2 bg-muted/40 hover:bg-muted transition-colors px-3 py-1.5 rounded-xl cursor-default">
                            <UserAvatar initial={initial} size="sm" />
                            <span className="text-xs font-bold text-foreground">{firstName}</span>
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main
<<<<<<< HEAD
                    className="flex-1 overflow-y-auto"
                    style={{
                        paddingBottom: 'calc(var(--bottom-nav-h, 64px) + env(safe-area-inset-bottom, 0px))',
                        background: 'radial-gradient(ellipse at top, #0f1020 0%, #070911 50%)'
                    }}
                >
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
=======
                    className="flex-1 overflow-y-auto bg-muted/20"
                    style={{ paddingBottom: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px))' }}
                >
                    <div className="max-w-7xl mx-auto p-4 sm:p-5 lg:p-7 animate-fade-in">
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
                        <Outlet />
                    </div>
                </main>
            </div>

            <BottomNav currentPath={location.pathname} />
        </div>
    );
}
