import { create } from 'zustand';

interface Admin {
    id: string;
    email: string;
}

interface AuthState {
    token: string | null;
    admin: Admin | null;
    login: (token: string, admin: Admin) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('hub_admin_token'),
    admin: JSON.parse(localStorage.getItem('hub_admin_data') || 'null'),
    login: (token, admin) => {
        localStorage.setItem('hub_admin_token', token);
        localStorage.setItem('hub_admin_data', JSON.stringify(admin));
        set({ token, admin });
    },
    logout: () => {
        localStorage.removeItem('hub_admin_token');
        localStorage.removeItem('hub_admin_data');
        set({ token: null, admin: null });
    }
}));
