import { useState } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
    LayoutDashboard, Users, Settings, LogOut,
    ChevronLeft, ChevronRight, Menu, X, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', badge: null },
    { icon: Users, label: 'Empresas', path: '/companies', badge: null },
    { icon: Settings, label: 'Configurações', path: '/settings', badge: null },
];

/* ─── Desktop Sidebar ─── */
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
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'hidden md:flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out border-r border-border bg-background',
                    collapsed ? 'w-[72px]' : 'w-[240px]'
                )}
            >
                {/* Brand */}
                <div className={cn(
                    'flex items-center h-16 px-4 shrink-0 border-b border-border',
                    collapsed ? 'justify-center' : 'gap-3'
                )}>
                    <div
                        className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-black text-[13px] text-white shadow-md"
                        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #374151 100%)' }}
                    >
                        NH
                    </div>
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-foreground leading-tight tracking-tight truncate">NetControl</p>
                            <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Hub</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => {
                        const active = currentPath === path;
                        const item = (
                            <Link
                                key={path}
                                to={path}
                                className={cn(
                                    'group relative flex items-center rounded-xl transition-all duration-200 h-10',
                                    collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                                    active
                                        ? 'bg-foreground text-background'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                {/* Active stripe */}
                                {active && !collapsed && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-foreground" />
                                )}
                                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2.5 : 1.8} />
                                {!collapsed && (
                                    <>
                                        <span className="text-sm font-medium truncate flex-1">{label}</span>
                                        {badge && (
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{badge}</Badge>
                                        )}
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

                {/* User + Logout */}
                <div className={cn('p-3 space-y-2', collapsed ? 'items-center' : '')}>
                    {/* Avatar row */}
                    {!collapsed && (
                        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors cursor-default">
                            <Avatar className="w-7 h-7">
                                <AvatarFallback className="text-xs bg-foreground text-background font-bold">{initial}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-foreground truncate leading-tight">{email || 'admin@admin.com'}</p>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Admin Master</p>
                            </div>
                        </div>
                    )}

                    {/* Logout */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={onLogout}
                                className={cn(
                                    'w-full flex items-center gap-2 rounded-xl h-9 px-2 text-xs font-medium text-muted-foreground',
                                    'hover:text-destructive hover:bg-destructive/8 transition-all duration-200',
                                    collapsed ? 'justify-center' : ''
                                )}
                            >
                                <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                                {!collapsed && <span>Sair</span>}
                            </button>
                        </TooltipTrigger>
                        {collapsed && <TooltipContent side="right">Sair</TooltipContent>}
                    </Tooltip>

                    {/* Collapse toggle */}
                    <Separator />
                    <button
                        onClick={onToggle}
                        className={cn(
                            'w-full flex items-center gap-2 rounded-xl h-8 px-2 text-[10px] font-medium uppercase tracking-widest',
                            'text-muted-foreground hover:text-foreground hover:bg-muted transition-all',
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
        </TooltipProvider>
    );
}

/* ─── Mobile Bottom Nav ─── */
function BottomNav({ currentPath }: { currentPath: string }) {
    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-border bg-background/95 backdrop-blur-xl pb-safe"
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
                            active ? 'text-foreground' : 'text-muted-foreground'
                        )}
                    >
                        {active && (
                            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-foreground" />
                        )}
                        <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
                        <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

/* ─── Mobile Header ─── */
interface MobileHeaderProps {
    drawerOpen: boolean;
    onToggleDrawer: () => void;
    currentLabel: string;
    email: string;
}

function MobileHeader({ drawerOpen, onToggleDrawer, currentLabel, email }: MobileHeaderProps) {
    const initial = email ? email.charAt(0).toUpperCase() : 'A';
    return (
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 shrink-0 border-b border-border bg-background/95 backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] text-white"
                    style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #374151 100%)' }}
                >
                    NH
                </div>
                <span className="text-sm font-bold text-foreground">NetControl</span>
                <span className="text-muted-foreground/40 text-xs">·</span>
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
                <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-[10px] bg-foreground text-background font-bold">{initial}</AvatarFallback>
                </Avatar>
            </div>
        </header>
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
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar */}
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(c => !c)}
                currentPath={location.pathname}
                email={email}
                onLogout={logout}
            />

            {/* Mobile Drawer */}
            {drawerOpen && (
                <>
                    <div
                        className="md:hidden fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div
                        className="md:hidden fixed inset-y-0 left-0 z-50 w-64 shadow-2xl bg-background border-r border-border"
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
                <MobileHeader
                    drawerOpen={drawerOpen}
                    onToggleDrawer={() => setDrawerOpen(d => !d)}
                    currentLabel={currentItem.label}
                    email={email}
                />

                {/* Desktop Header with breadcrumb */}
                <header className="hidden md:flex items-center justify-between px-8 h-16 shrink-0 border-b border-border bg-background">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-foreground">{currentItem.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                            <Bell className="w-4 h-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-semibold text-foreground">{email || 'admin@admin.com'}</p>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Admin Master</p>
                            </div>
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs bg-foreground text-background font-bold">
                                    {email ? email.charAt(0).toUpperCase() : 'A'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main
                    className="flex-1 overflow-y-auto bg-muted/30"
                    style={{ paddingBottom: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px))' }}
                >
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <BottomNav currentPath={location.pathname} />
        </div>
    );
}
