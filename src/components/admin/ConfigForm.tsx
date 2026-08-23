import { useState, useEffect, useRef } from 'react';
import { useRaffleStore } from '@/store/raffleStore';
import { PricingPlan } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Plus, X, Image, DollarSign, Calendar, Hash, Loader2, CreditCard, Upload, Trash2 } from 'lucide-react';
import { PaymentMethodsForm } from './PaymentMethodsForm';
import { supabase } from '@/integrations/supabase/client';

export function ConfigForm() {
  const { config, setConfig, saveConfig, loadConfig, isLoading } = useRaffleStore();
  const [localConfig, setLocalConfig] = useState(config);
  const [newSpec, setNewSpec] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPrize, setIsUploadingPrize] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const prizeImageRef = useRef<HTMLInputElement>(null);
  const bannerImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const addPlan = () => {
    const currentPlans = localConfig.plans || [];
    const nextQty = currentPlans.length > 0 ? Math.max(...currentPlans.map(p => p.quantity)) + 1 : 1;
    const newPlan: PricingPlan = {
      id: Date.now().toString(),
      quantity: nextQty,
      price: nextQty * 2000,
      label: `${nextQty} Boleta${nextQty > 1 ? 's' : ''}`,
      isPopular: false
    };
    setLocalConfig(prev => ({
      ...prev,
      plans: [...(prev.plans || []), newPlan]
    }));
  };

  const updatePlan = (id: string, field: keyof PricingPlan, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      plans: (prev.plans || []).map(p => {
        if (field === 'isPopular' && value === true) {
          return p.id === id ? { ...p, isPopular: true } : { ...p, isPopular: false };
        }
        if (p.id === id) {
          return { ...p, [field]: value };
        }
        return p;
      })
    }));
  };

  const removePlan = (id: string) => {
    setLocalConfig(prev => ({
      ...prev,
      plans: (prev.plans || []).filter(p => p.id !== id)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setConfig(localConfig);
    
    // Dar tiempo al state para actualizarse
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const success = await saveConfig();
    setIsSaving(false);
    
    if (success) {
      toast.success('Configuración guardada exitosamente');
    } else {
      toast.error('Error al guardar la configuración');
    }
  };

  const addSpecification = () => {
    if (newSpec.trim()) {
      setLocalConfig(prev => ({
        ...prev,
        specifications: [...prev.specifications, newSpec.trim()]
      }));
      setNewSpec('');
    }
  };

  const removeSpecification = (index: number) => {
    setLocalConfig(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (
    file: File, 
    type: 'prize' | 'banner',
    setLoading: (loading: boolean) => void
  ) => {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('raffle-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Error al subir la imagen');
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('raffle-images')
        .getPublicUrl(fileName);

      if (type === 'prize') {
        setLocalConfig(prev => ({ ...prev, prizeImage: publicUrl }));
      } else {
        setLocalConfig(prev => ({ ...prev, bannerImage: publicUrl }));
      }

      toast.success('Imagen subida exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar la imagen');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Información General */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <Hash className="w-4 h-4 text-primary-foreground" />
          </div>
          Información General
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Título de la Rifa</Label>
            <Input
              value={localConfig.title}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, title: e.target.value }))}
              className="bg-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Premio</Label>
            <Input
              value={localConfig.prize}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, prize: e.target.value }))}
              className="bg-input"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label>Descripción</Label>
            <Textarea
              value={localConfig.description}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, description: e.target.value }))}
              className="bg-input"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Número Inicial</Label>
            <Input
              type="number"
              value={localConfig.startNumber}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, startNumber: parseInt(e.target.value) || 0 }))}
              className="bg-input"
              min={0}
              placeholder="1000"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Número Final</Label>
            <Input
              type="number"
              value={localConfig.endNumber}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, endNumber: parseInt(e.target.value) || 9999 }))}
              className="bg-input"
              min={localConfig.startNumber + 1}
              placeholder="9999"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl md:col-span-2">
            <div>
              <Label>Total de Boletas</Label>
              <p className="text-sm text-muted-foreground">
                {localConfig.endNumber - localConfig.startNumber + 1} números disponibles
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Fecha del Sorteo
            </Label>
            <Input
              type="date"
              value={localConfig.drawDate}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, drawDate: e.target.value }))}
              className="bg-input"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl md:col-span-2">
            <div>
              <Label>Rifa Activa</Label>
              <p className="text-sm text-muted-foreground">Permite compras de boletas</p>
            </div>
            <Switch
              checked={localConfig.isActive}
              onCheckedChange={(checked) => setLocalConfig(prev => ({ ...prev, isActive: checked }))}
            />
          </div>
        </div>
      </div>

      {/* Precios y Planes */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary-foreground" />
            </div>
            Configuración de Precios y Planes
          </h2>
          <Button type="button" onClick={addPlan} variant="outline" className="gap-2 border-primary/30 shrink-0">
            <Plus className="w-4 h-4" /> Agregar Plan
          </Button>
        </div>
        
        <div className="mb-6 max-w-xs space-y-2">
          <Label>Moneda</Label>
          <Input
            value={localConfig.currency}
            onChange={(e) => setLocalConfig(prev => ({ ...prev, currency: e.target.value }))}
            className="bg-input"
            placeholder="COP"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Planes de Boletas Disponibles</Label>
          {(localConfig.plans || []).map((plan, index) => (
            <div key={plan.id || index} className="p-4 bg-muted/40 border border-border/50 rounded-xl space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Etiqueta del Plan</Label>
                  <Input
                    value={plan.label || ''}
                    onChange={(e) => updatePlan(plan.id, 'label', e.target.value)}
                    placeholder="Ej. Cuatro Boletas"
                    className="bg-input text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cant. Boletas</Label>
                  <Input
                    type="number"
                    min={1}
                    value={plan.quantity}
                    onChange={(e) => updatePlan(plan.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="bg-input text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Precio ({localConfig.currency})</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={plan.price}
                    onChange={(e) => updatePlan(plan.id, 'price', parseFloat(e.target.value) || 0)}
                    className="bg-input text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!plan.isPopular}
                    onCheckedChange={(checked) => updatePlan(plan.id, 'isPopular', checked)}
                  />
                  <span className="text-xs text-muted-foreground">Más popular</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removePlan(plan.id)}
                  disabled={(localConfig.plans || []).length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Imágenes */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <Image className="w-4 h-4 text-primary-foreground" />
          </div>
          Imágenes
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Imagen del Premio */}
          <div className="space-y-2">
            <Label>Imagen del Premio</Label>
            <input
              ref={prizeImageRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'prize', setIsUploadingPrize);
              }}
              className="hidden"
            />
            <div className="flex gap-2">
              <Input
                value={localConfig.prizeImage}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, prizeImage: e.target.value }))}
                className="bg-input flex-1"
                placeholder="URL de imagen o sube una..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => prizeImageRef.current?.click()}
                disabled={isUploadingPrize}
                className="shrink-0"
              >
                {isUploadingPrize ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </Button>
            </div>
            {localConfig.prizeImage && (
              <img 
                src={localConfig.prizeImage} 
                alt="Preview" 
                className="mt-2 h-32 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
          
          {/* Imagen Banner */}
          <div className="space-y-2">
            <Label>Imagen Banner</Label>
            <input
              ref={bannerImageRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'banner', setIsUploadingBanner);
              }}
              className="hidden"
            />
            <div className="flex gap-2">
              <Input
                value={localConfig.bannerImage}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, bannerImage: e.target.value }))}
                className="bg-input flex-1"
                placeholder="URL de imagen o sube una..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => bannerImageRef.current?.click()}
                disabled={isUploadingBanner}
                className="shrink-0"
              >
                {isUploadingBanner ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </Button>
            </div>
            {localConfig.bannerImage && (
              <img 
                src={localConfig.bannerImage} 
                alt="Preview" 
                className="mt-2 h-32 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Especificaciones */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6">Especificaciones del Sorteo</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSpec}
              onChange={(e) => setNewSpec(e.target.value)}
              placeholder="Nueva especificación..."
              className="bg-input"
              onKeyDown={(e) => e.key === 'Enter' && addSpecification()}
            />
            <Button onClick={addSpecification} className="gold-gradient text-primary-foreground">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <ul className="space-y-2">
            {localConfig.specifications.map((spec, index) => (
              <li key={index} className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                <span className="flex-1">{spec}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeSpecification(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Métodos de Pago */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary-foreground" />
          </div>
          Métodos de Pago
        </h2>
        
        <PaymentMethodsForm
          paymentMethods={localConfig.paymentMethods || []}
          onChange={(methods) => setLocalConfig(prev => ({ ...prev, paymentMethods: methods }))}
        />
      </div>

      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="w-full gold-gradient text-primary-foreground py-6 text-lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Guardar Configuración
          </>
        )}
      </Button>
    </div>
  );
}
