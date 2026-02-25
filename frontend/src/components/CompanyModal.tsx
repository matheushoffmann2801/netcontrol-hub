import React, { useState, useEffect } from 'react';
import { X, Check, Shield, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const MODULES_AVAILABLE = [
  { id: 'BASE', label: 'Base Atual (Core)' },
  { id: 'FINANCEIRO', label: 'Financeiro' },
  { id: 'INVENTARIO', label: 'Inventário' },
  { id: 'ATIVOS_FROTA', label: 'Ativos & Frota' },
  { id: 'OPERACIONAL', label: 'Operacional' },
  { id: 'PAINEL_TECNICO', label: 'Painel Técnico' },
  { id: 'CONTRATOS', label: 'Contratos' },
  { id: 'FULL_ACCESS', label: 'Todas (Acesso Total)' },
];

export function CompanyModal({ isOpen, onClose, onSubmit, initialData }: CompanyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    modules: [] as string[],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        document: initialData.document || '',
        modules: initialData.license?.modules || [],
      });
    } else {
      setFormData({ name: '', document: '', modules: ['BASE'] });
    }
  }, [initialData, isOpen]);

  const toggleModule = (moduleId: string) => {
    setFormData((prev) => {
      const isSelected = prev.modules.includes(moduleId);
      let newModules = isSelected
        ? prev.modules.filter((id) => id !== moduleId)
        : [...prev.modules, moduleId];

      // Lógica para "FULL_ACCESS"
      if (moduleId === 'FULL_ACCESS' && !isSelected) {
        newModules = MODULES_AVAILABLE.map((m) => m.id);
      } else if (moduleId === 'FULL_ACCESS' && isSelected) {
        newModules = ['BASE'];
      } else if (isSelected && prev.modules.includes('FULL_ACCESS')) {
        // Se desmarcar um item individual enquanto FULL está ativo, remove o FULL
        newModules = newModules.filter((id) => id !== 'FULL_ACCESS');
      }

      return { ...prev, modules: newModules };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {initialData ? 'Editar Empresa' : 'Nova Licença Enterprise'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Nome da Empresa</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: Provedor X"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">CNPJ / Documento</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="00.000.000/0001-00"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Módulos Ativos
              </label>
              <button
                type="button"
                onClick={() => toggleModule('FULL_ACCESS')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {formData.modules.includes('FULL_ACCESS') ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODULES_AVAILABLE.map((module) => {
                const isSelected = formData.modules.includes(module.id);
                const isFull = module.id === 'FULL_ACCESS';
                
                return (
                  <div
                    key={module.id}
                    onClick={() => toggleModule(module.id)}
                    className={twMerge(
                      "cursor-pointer relative group flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                      isSelected 
                        ? "bg-blue-50 border-blue-200 shadow-sm" 
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                      isFull && isSelected && "bg-emerald-50 border-emerald-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                        isSelected 
                          ? (isFull ? "bg-emerald-500 border-emerald-500" : "bg-blue-600 border-blue-600")
                          : "border-slate-300 group-hover:border-slate-400"
                      )}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <span className={clsx(
                        "font-bold text-sm",
                        isSelected ? "text-slate-800" : "text-slate-500"
                      )}>
                        {module.label}
                      </span>
                    </div>
                    {isFull && <Zap className={clsx("w-4 h-4", isSelected ? "text-emerald-500" : "text-slate-300")} />}
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-all font-bold text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {initialData ? 'Salvar Alterações' : 'Gerar Licença'}
          </button>
        </div>
      </div>
    </div>
  );
}