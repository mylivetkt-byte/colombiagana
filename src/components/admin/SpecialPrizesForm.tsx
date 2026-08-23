import { useState, useEffect } from 'react';
import { useRaffleStore } from '@/store/raffleStore';
import { SpecialPrize } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Gift, DollarSign, Trophy, Eye, EyeOff, Shuffle } from 'lucide-react';

export function SpecialPrizesForm() {
  const { specialPrizes, loadSpecialPrizes, addSpecialPrize, updateSpecialPrize, deleteSpecialPrize, config, configId } = useRaffleStore();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    ticketNumber: '',
    prizeType: 'article' as 'article' | 'money',
    prizeDescription: '',
    prizeAmount: '',
    isActive: false
  });
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadSpecialPrizes();
  }, [configId]);

  /**
   * Auto-asignación por hueco más ancho (widest-gap algorithm).
   *
   * Ordena los números ya asignados y encuentra el espacio libre más grande
   * entre ellos (incluyendo los extremos del rango). Coloca el nuevo número
   * en el centro de ese hueco con un pequeño jitter (~15%), garantizando
   * que quede tan alejado como sea posible de cualquier otro premio.
   *
   * Ejemplo con rango 1000-9999 y premios en [3500, 7000]:
   *   Huecos: [1000-3499]=2499, [3501-6999]=3498, [7001-9999]=2998
   *   → Hueco más ancho: 3501-6999 → candidato ~5250 ± jitter
   */
  const autoAssignNumber = () => {
    const start = config.startNumber;
    const end = config.endNumber;
    const rangeSize = end - start + 1;

    // Premios ya existentes ordenados ascendentemente
    const existing = [...specialPrizes.map(p => p.ticketNumber)].sort((a, b) => a - b);

    if (existing.length === 0) {
      // Sin premios previos: colocar cerca del centro con variación aleatoria
      const center = Math.floor((start + end) / 2);
      const jitter = Math.floor((Math.random() - 0.5) * rangeSize * 0.3);
      const picked = Math.max(start, Math.min(end, center + jitter));
      setForm(p => ({ ...p, ticketNumber: String(picked) }));
      toast.success(`Número sugerido: ${picked}`);
      return;
    }

    // Construir fronteras virtuales fuera del rango para calcular huecos extremos
    const boundaries = [start - 1, ...existing, end + 1];

    let widestGapSize = -1;
    let widestGapStart = start;
    let widestGapEnd = end;

    for (let i = 0; i < boundaries.length - 1; i++) {
      const gapStart = boundaries[i] + 1;
      const gapEnd = boundaries[i + 1] - 1;
      const gapSize = gapEnd - gapStart + 1;

      if (gapSize > widestGapSize) {
        widestGapSize = gapSize;
        widestGapStart = gapStart;
        widestGapEnd = gapEnd;
      }
    }

    // Colocar en el centro del hueco más ancho con pequeño jitter (±15% del hueco)
    const center = Math.floor((widestGapStart + widestGapEnd) / 2);
    const maxJitter = Math.floor(widestGapSize * 0.15);
    const jitter = Math.floor((Math.random() - 0.5) * 2 * maxJitter);
    const picked = Math.max(widestGapStart, Math.min(widestGapEnd, center + jitter));

    setForm(p => ({ ...p, ticketNumber: String(picked) }));
    toast.success(`Número sugerido: ${picked} — zona más libre del rango (hueco de ${widestGapSize} números)`);
  };

  const handleAdd = async () => {
    if (!form.ticketNumber || !form.prizeDescription) {
      toast.error('Completa el número de boleta y la descripción del premio');
      return;
    }
    const num = parseInt(form.ticketNumber);
    if (isNaN(num) || num < config.startNumber || num > config.endNumber) {
      toast.error(`El número debe estar entre ${config.startNumber} y ${config.endNumber}`);
      return;
    }
    const ok = await addSpecialPrize({
      ticketNumber: num,
      prizeType: form.prizeType,
      prizeDescription: form.prizeDescription,
      prizeAmount: form.prizeType === 'money' && form.prizeAmount ? parseFloat(form.prizeAmount) : undefined,
      isActive: form.isActive
    });
    if (ok) {
      toast.success('Premio especial agregado');
      setForm({ ticketNumber: '', prizeType: 'article', prizeDescription: '', prizeAmount: '', isActive: false });
      setIsAdding(false);
    } else {
      toast.error('Error al agregar el premio');
    }
  };

  const handleToggleActive = async (prize: SpecialPrize) => {
    setSavingId(prize.id);
    const ok = await updateSpecialPrize(prize.id, { isActive: !prize.isActive });
    setSavingId(null);
    if (ok) {
      toast.success(prize.isActive ? 'Premio ocultado' : 'Premio activado y visible al público');
    } else {
      toast.error('Error al actualizar el premio');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteSpecialPrize(id);
    if (ok) toast.success('Premio eliminado');
    else toast.error('Error al eliminar');
  };

  const handleActivateAll = async () => {
    for (const p of specialPrizes.filter(p => !p.isActive)) {
      await updateSpecialPrize(p.id, { isActive: true });
    }
    toast.success('Todos los premios ahora son visibles al público');
  };

  const handleDeactivateAll = async () => {
    for (const p of specialPrizes.filter(p => p.isActive)) {
      await updateSpecialPrize(p.id, { isActive: false });
    }
    toast.success('Todos los premios ocultados');
  };

  const activeCount = specialPrizes.filter(p => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Stats banner */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-xl text-sm">
          <Trophy className="w-4 h-4 text-accent" />
          <span>{specialPrizes.length} premios creados</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-xl text-sm">
          <Eye className="w-4 h-4 text-primary" />
          <span>{activeCount} activos (visibles al público)</span>
        </div>
      </div>

      {/* Global controls */}
      {specialPrizes.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <Button type="button" variant="outline" size="sm" className="gap-2 border-accent/30 text-accent hover:text-accent" onClick={handleActivateAll}>
            <Eye className="w-4 h-4" /> Activar todos
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleDeactivateAll}>
            <EyeOff className="w-4 h-4" /> Ocultar todos
          </Button>
        </div>
      )}

      {/* Prizes list */}
      {specialPrizes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay premios especiales creados aún.</p>
        </div>
      )}

      <div className="space-y-3">
        {specialPrizes.map(prize => (
          <div key={prize.id} className={`p-4 rounded-xl border transition-all ${prize.isActive ? 'border-accent/40 bg-accent/5' : 'border-border/50 bg-muted/20'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Number badge */}
              <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center font-display font-bold text-xl text-primary-foreground shrink-0">
                {prize.ticketNumber}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {prize.prizeType === 'money' ? (
                    <DollarSign className="w-4 h-4 text-accent shrink-0" />
                  ) : (
                    <Gift className="w-4 h-4 text-primary shrink-0" />
                  )}
                  <span className="font-semibold truncate">{prize.prizeDescription}</span>
                  {prize.prizeAmount && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      ${prize.prizeAmount.toLocaleString()} {useRaffleStore.getState().config.currency}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Tipo: {prize.prizeType === 'money' ? 'Dinero' : 'Artículo'}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={prize.isActive}
                    disabled={savingId === prize.id}
                    onCheckedChange={() => handleToggleActive(prize)}
                  />
                  <span className={`text-xs font-medium ${prize.isActive ? 'text-accent' : 'text-muted-foreground'}`}>
                    {prize.isActive ? 'Visible' : 'Oculto'}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(prize.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {isAdding ? (
        <div className="p-5 border border-primary/30 rounded-xl bg-primary/5 space-y-4">
          <h4 className="font-semibold">Nuevo Premio Especial</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Número de Boleta</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`${config.startNumber} – ${config.endNumber}`}
                  value={form.ticketNumber}
                  onChange={e => setForm(p => ({ ...p, ticketNumber: e.target.value }))}
                  className="bg-input flex-1"
                  min={config.startNumber}
                  max={config.endNumber}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Auto-asignar número distribuido uniformemente"
                  onClick={autoAssignNumber}
                  className="shrink-0 border-accent/30 text-accent hover:text-accent"
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Usa <Shuffle className="w-3 h-3 inline" /> para asignar un número automáticamente distribuido en el rango, evitando que los premios queden muy juntos.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tipo de Premio</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={form.prizeType === 'article' ? 'default' : 'outline'}
                  size="sm"
                  className={`flex-1 gap-2 ${form.prizeType === 'article' ? 'gold-gradient text-primary-foreground' : ''}`}
                  onClick={() => setForm(p => ({ ...p, prizeType: 'article' }))}
                >
                  <Gift className="w-4 h-4" /> Artículo
                </Button>
                <Button
                  type="button"
                  variant={form.prizeType === 'money' ? 'default' : 'outline'}
                  size="sm"
                  className={`flex-1 gap-2 ${form.prizeType === 'money' ? 'gold-gradient text-primary-foreground' : ''}`}
                  onClick={() => setForm(p => ({ ...p, prizeType: 'money' }))}
                >
                  <DollarSign className="w-4 h-4" /> Dinero
                </Button>
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Descripción del Premio</Label>
              <Input
                placeholder="Ej: iPhone 15, $500.000 COP, Smart TV 55..."
                value={form.prizeDescription}
                onChange={e => setForm(p => ({ ...p, prizeDescription: e.target.value }))}
                className="bg-input"
              />
            </div>
            {form.prizeType === 'money' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Monto ({config.currency})</Label>
                <Input
                  type="number"
                  placeholder="500000"
                  value={form.prizeAmount}
                  onChange={e => setForm(p => ({ ...p, prizeAmount: e.target.value }))}
                  className="bg-input"
                  min={0}
                />
              </div>
            )}
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={checked => setForm(p => ({ ...p, isActive: checked }))}
              />
              <span className="text-sm text-muted-foreground">Activar y mostrar inmediatamente en la página de ganadores</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={handleAdd} className="gold-gradient text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Guardar Premio
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="gap-2 border-primary/30 w-full"
        >
          <Plus className="w-4 h-4" /> Agregar Premio Especial
        </Button>
      )}
    </div>
  );
}
