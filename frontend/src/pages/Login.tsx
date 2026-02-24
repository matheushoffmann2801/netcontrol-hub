import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Server } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/axios';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token, response.data.admin);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao efetuar login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden font-sans">
            {/* Background decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />

            <div className="w-full max-w-md p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl relative z-10 transition-all duration-300 hover:shadow-blue-900/20">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 transition-transform hover:scale-105 duration-300">
                        <Server className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                        NetControl Hub
                    </h1>
                    <p className="text-gray-400 text-sm">Control Plane Admin</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            E-mail
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-900/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="admin@netcontrol.com.br"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Senha
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-900/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 duration-200"
                    >
                        {loading ? 'Entrando...' : 'Entrar no Hub'}
                    </button>
                </form>
            </div>
        </div>
    );
}
