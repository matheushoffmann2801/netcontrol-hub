import { create } from 'zustand';

export interface Admin {
    id: string;
    email: string;
    name?: string; // display name set by user
}

/** Extract a friendly first name from an email or stored name */
export function getFirstName(admin: Admin | null): string {
    if (!admin) return 'Admin';
    if (admin.name && admin.name.trim()) return admin.name.trim().split(' ')[0];
    // Extract from email: "matheushoffmann.2801@..." → "Matheus"
    const local = admin.email.split('@')[0]; // "matheushoffmann.2801"
    const part = local.split(/[.\-_0-9]/)[0]; // "matheushoffmann"
    // Capitalise
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

interface AuthState {
    token: string | null;
    admin: Admin | null;
    login: (token: string, admin: Admin) => void;
    logout: () => void;
    setDisplayName: (name: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    token: localStorage.getItem('hub_admin_token'),
    admin: JSON.parse(localStorage.getItem('hub_admin_data') || 'null'),

    login: (token, admin) => {
        // Preserve existing displayName if already set
        const existing = get().admin;
        const merged: Admin = { ...admin, name: existing?.name ?? admin.name ?? '' };
        localStorage.setItem('hub_admin_token', token);
        localStorage.setItem('hub_admin_data', JSON.stringify(merged));
        set({ token, admin: merged });
    },

    logout: () => {
        localStorage.removeItem('hub_admin_token');
        localStorage.removeItem('hub_admin_data');
        set({ token: null, admin: null });
    },

    setDisplayName: (name: string) => {
        const { admin } = get();
        if (!admin) return;
        const updated = { ...admin, name };
        localStorage.setItem('hub_admin_data', JSON.stringify(updated));
        set({ admin: updated });
    },
}));
