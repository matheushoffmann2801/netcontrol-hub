import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Server, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden font-sans">
            {/* Animated Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[180px] opacity-[0.08] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600 rounded-full blur-[180px] opacity-[0.08] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-cyan-500 rounded-full blur-[150px] opacity-[0.05] pointer-events-none" />

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }}
            />

            <div className="w-full max-w-[420px] p-10 relative z-10">
                {/* Logo & Branding */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group mb-6">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-violet-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                        <div className="relative w-20 h-20 bg-gradient-to-tr from-blue-500 via-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 transition-transform hover:scale-105 duration-300">
                            <Shield className="text-white w-10 h-10" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                        NetControl <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Hub</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium tracking-wide">Control Plane • Admin Panel</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center font-medium flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] ml-1">
                                E-mail
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-blue-400 transition-colors duration-300">
                                    <Mail className="h-4.5 w-4.5" strokeWidth={1.5} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3.5 border border-white/[0.08] bg-white/[0.03] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white/[0.05] transition-all duration-300 text-sm"
                                    placeholder="admin@netcontrol.com.br"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] ml-1">
                                Senha
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-blue-400 transition-colors duration-300">
                                    <Lock className="h-4.5 w-4.5" strokeWidth={1.5} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-12 py-3.5 border border-white/[0.08] bg-white/[0.03] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white/[0.05] transition-all duration-300 text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-[0.98] mt-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Acessar Painel
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-[11px] text-gray-600 tracking-[0.2em] uppercase font-medium">
                        Powered by NetControl Security
                    </p>
                </div>
            </div>
        </div>
    );
}
