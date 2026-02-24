import React, { useState } from 'react';
import { X, Check, Building2, Palette, Shield, Loader2 } from 'lucide-react';
import { api } from '../lib/axios';
import { toast } from 'sonner';

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const MODULES_AVAILABLE = [
    { id: 'FINANCE', label: 'Financeiro' },
    { id: 'NOC', label: 'NOC / Monitoramento' },
    { id: 'SUPPORT', label: 'Suporte (Tickets)' },
    { id: 'STOCK', label: 'Estoque' },
    { id: 'CRM', label: 'CRM / Vendas' },
];

export function CompanyModal({ isOpen, onClose, onSuccess }: CompanyModalProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        document: '',
        systemName: 'NetControl',
        primaryColor: '#0ea5e9',
        logoUrl: '',
        modules: [] as string[],
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleModule = (moduleId: string) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.includes(moduleId)
                ? prev.modules.filter(m => m !== moduleId)
                : [...prev.modules, moduleId]
        }));
    };

    const validateStep1 = () => formData.name && formData.document;
    const validateStep2 = () => formData.systemName && formData.primaryColor;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) return;

        setLoading(true);
        try {
            const { data } = await api.post('/companies', formData);
            toast.success('Empresa registrada com sucesso!', {
                description: `Licença gerada. Válida até ${new Date(data.expiresAt).toLocaleDateString()}.`
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error('Erro ao registrar empresa', {
                description: error.response?.data?.error || 'Verifique sua conexão ou tente novamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Nova Empresa</h2>
                        <p className="text-xs text-gray-500 font-medium">Cadastre e gere a licença automaticamente</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Stepper indicator */}
                    <div className="flex items-center justify-between mb-8 relative">
                        <div className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-gray-200 -z-10"></div>

                        {[
                            { num: 1, label: 'Dados', icon: Building2 },
                            { num: 2, label: 'Layout', icon: Palette },
                            { num: 3, label: 'Módulos', icon: Shield }
                        ].map((s) => {
                            const isActive = step === s.num;
                            const isCompleted = step > s.num;
                            return (
                                <div key={s.num} className="flex flex-col items-center bg-white px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' :
                                            isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {isCompleted ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`text-xs font-bold ${isActive ? 'text-blue-900' : 'text-gray-400'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <form id="company-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* STEP 1: DADOS */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Empresa</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Ex: Provedor XYZ Telecom"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ / Documento</label>
                                    <input
                                        name="document"
                                        value={formData.document}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                                        placeholder="00.000.000/0001-00"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 2: PERSONALIZAÇÃO */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome no Sistema (Label do App)</label>
                                    <input
                                        name="systemName"
                                        value={formData.systemName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                                        required
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Logo URL (Opcional)</label>
                                        <input
                                            name="logoUrl"
                                            value={formData.logoUrl}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cor Primária</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                name="primaryColor"
                                                value={formData.primaryColor}
                                                onChange={handleChange}
                                                className="h-11 w-11 rounded-xl cursor-pointer border-0 p-0"
                                            />
                                            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                                                {formData.primaryColor}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: MÓDULOS */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <p className="text-sm text-gray-500 mb-3">
                                    Selecione os módulos que esta empresa terá acesso na licença gerada.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {MODULES_AVAILABLE.map((mod) => {
                                        const isSelected = formData.modules.includes(mod.id);
                                        return (
                                            <div
                                                key={mod.id}
                                                onClick={() => toggleModule(mod.id)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${isSelected
                                                        ? 'border-blue-500 bg-blue-50/50'
                                                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className={`font-semibold text-sm ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                                    {mod.label}
                                                </span>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                                    }`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between rounded-b-2xl">
                    <button
                        type="button"
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        className={`px-5 py-2.5 font-semibold text-sm rounded-xl transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 hover:bg-gray-200 bg-gray-100'
                            }`}
                    >
                        Voltar
                    </button>

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={() => setStep(s => s + 1)}
                            disabled={(step === 1 && !validateStep1()) || (step === 2 && !validateStep2())}
                            className="px-5 py-2.5 font-semibold text-sm rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-gray-900/20"
                        >
                            Próximo
                        </button>
                    ) : (
                        <button
                            type="submit"
                            form="company-form"
                            disabled={loading}
                            className="flex items-center space-x-2 px-6 py-2.5 font-bold text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{loading ? 'Gerando Licença...' : 'Finalizar Registro'}</span>
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
