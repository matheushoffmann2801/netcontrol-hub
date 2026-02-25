import React, { useState, useEffect } from 'react';
import { Check, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const MODULES_AVAILABLE = [
  { id: 'BASE', label: 'Core', description: 'Base Atual' },
  { id: 'FINANCEIRO', label: 'Financeiro', description: 'Gestão financeira' },
  { id: 'INVENTARIO', label: 'Inventário', description: 'Controle de estoque' },
  { id: 'ATIVOS_FROTA', label: 'Frota', description: 'Ativos & Frota' },
  { id: 'OPERACIONAL', label: 'Operacional', description: 'Ops & Field' },
  { id: 'PAINEL_TECNICO', label: 'Técnico', description: 'Painel de técnicos' },
  { id: 'CONTRATOS', label: 'Contratos', description: 'Gestão contratual' },
  { id: 'FULL_ACCESS', label: 'Full Access', description: 'Todos os módulos' },
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
    setFormData(prev => {
      const isSelected = prev.modules.includes(moduleId);
      let newModules = isSelected
        ? prev.modules.filter(id => id !== moduleId)
        : [...prev.modules, moduleId];

      if (moduleId === 'FULL_ACCESS' && !isSelected) {
        newModules = MODULES_AVAILABLE.map(m => m.id);
      } else if (moduleId === 'FULL_ACCESS' && isSelected) {
        newModules = ['BASE'];
      } else if (isSelected && prev.modules.includes('FULL_ACCESS')) {
        newModules = newModules.filter(id => id !== 'FULL_ACCESS');
      }

      return { ...prev, modules: newModules };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Custom styled header */}
        <div className="px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
          <DialogHeader>
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-foreground rounded-xl">
                <Shield className="w-5 h-5 text-background" strokeWidth={2} />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  {initialData ? 'Editar Empresa' : 'Nova Empresa'}
                </DialogTitle>
                <DialogDescription className="text-[11px] uppercase tracking-widest mt-0.5">
                  Control Plane License
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                required
                placeholder="Ex: Provedor NetX"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-doc">CNPJ / Documento</Label>
              <Input
                id="company-doc"
                required
                placeholder="00.000.000/0001-00"
                value={formData.document}
                onChange={e => setFormData({ ...formData, document: e.target.value })}
              />
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Módulos ({formData.modules.length}/{MODULES_AVAILABLE.length})
              </Label>
              <button
                type="button"
                onClick={() => toggleModule('FULL_ACCESS')}
                className="text-[10px] font-semibold text-primary hover:underline uppercase tracking-wider"
              >
                {formData.modules.includes('FULL_ACCESS') ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MODULES_AVAILABLE.map(module => {
                const selected = formData.modules.includes(module.id);
                const isFull = module.id === 'FULL_ACCESS';
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className={cn(
                      'relative flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selected
                        ? isFull
                          ? 'border-emerald-500 bg-emerald-50 text-foreground shadow-sm'
                          : 'border-foreground bg-foreground/5 text-foreground shadow-sm'
                        : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {/* Checkmark */}
                    <div className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center',
                      selected
                        ? isFull ? 'bg-emerald-500 border-emerald-500' : 'bg-foreground border-foreground'
                        : 'border-muted-foreground/40'
                    )}>
                      {selected && <Check className="w-2.5 h-2.5 text-background" strokeWidth={3} />}
                    </div>
                    <span className="text-xs font-semibold leading-tight">{module.label}</span>
                    <span className="text-[9px] opacity-60 leading-tight">{module.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected tags */}
            {formData.modules.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.modules.filter(m => m !== 'FULL_ACCESS').map(mod => (
                  <Badge key={mod} variant="secondary" className="text-[10px] font-mono">{mod}</Badge>
                ))}
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit} className="gap-2">
            <Shield className="w-4 h-4" strokeWidth={2} />
            {initialData ? 'Salvar Alterações' : 'Gerar Licença'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}