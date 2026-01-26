import { useState, useEffect } from 'react';
import { useRaffleStore } from '@/store/raffleStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Plus, X, Image, DollarSign, Calendar, Hash, Loader2 } from 'lucide-react';

export function ConfigForm() {
  const { config, setConfig, saveConfig, loadConfig, isLoading } = useRaffleStore();
  const [localConfig, setLocalConfig] = useState(config);
  const [newSpec, setNewSpec] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

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

      {/* Precios */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-primary-foreground" />
          </div>
          Configuración de Precios
        </h2>
        
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Moneda</Label>
            <Input
              value={localConfig.currency}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, currency: e.target.value }))}
              className="bg-input"
              placeholder="USD"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Precio 1 Boleta</Label>
            <Input
              type="number"
              value={localConfig.priceOne}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, priceOne: parseFloat(e.target.value) || 0 }))}
              className="bg-input"
              min={0}
              step={0.01}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Precio 2 Boletas</Label>
            <Input
              type="number"
              value={localConfig.priceTwo}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, priceTwo: parseFloat(e.target.value) || 0 }))}
              className="bg-input"
              min={0}
              step={0.01}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Precio 3 Boletas</Label>
            <Input
              type="number"
              value={localConfig.priceThree}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, priceThree: parseFloat(e.target.value) || 0 }))}
              className="bg-input"
              min={0}
              step={0.01}
            />
          </div>
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
          <div className="space-y-2">
            <Label>URL Imagen del Premio</Label>
            <Input
              value={localConfig.prizeImage}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, prizeImage: e.target.value }))}
              className="bg-input"
              placeholder="https://..."
            />
            {localConfig.prizeImage && (
              <img src={localConfig.prizeImage} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
            )}
          </div>
          
          <div className="space-y-2">
            <Label>URL Imagen Banner</Label>
            <Input
              value={localConfig.bannerImage}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, bannerImage: e.target.value }))}
              className="bg-input"
              placeholder="https://..."
            />
            {localConfig.bannerImage && (
              <img src={localConfig.bannerImage} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
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
