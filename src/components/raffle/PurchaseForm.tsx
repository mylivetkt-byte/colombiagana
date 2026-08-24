import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRaffleStore } from '@/store/raffleStore';
import { TicketPurchase } from '@/types/raffle';
import { Loader2, CheckCircle, Mail, Phone, User, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { formatMoney } from '@/lib/format';
import { supabase } from '@/integrations/supabase/client';

interface PurchaseFormProps {
  selectedQuantity: number;
  onPurchaseComplete: (purchase: TicketPurchase) => void;
}

export function PurchaseForm({ selectedQuantity, onPurchaseComplete }: PurchaseFormProps) {
  const { config, generateRandomNumbers } = useRaffleStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const getPrice = () => {
    if (config.plans && config.plans.length > 0) {
      const match = config.plans.find(p => p.quantity === selectedQuantity);
      if (match) return match.price;
    }
    switch (selectedQuantity) {
      case 1: return config.priceOne;
      case 2: return config.priceTwo;
      case 3: return config.priceThree;
      default: {
        const singlePrice = config.priceOne || 2000;
        return singlePrice * selectedQuantity;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // Generar números aleatorios al momento de la compra
      const assignedNumbers = generateRandomNumbers(selectedQuantity);
      
      if (assignedNumbers.length !== selectedQuantity) {
        toast.error('No hay suficientes números disponibles');
        setIsLoading(false);
        return;
      }

      // Guardar en la base de datos
      const { data: raffleConfig, error: configError } = await supabase
        .from('raffle_config')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (configError) {
        console.error('Error loading raffle config:', configError);
        toast.error('Error al cargar la configuración de la rifa');
        setIsLoading(false);
        return;
      }

      if (!raffleConfig?.id) {
        toast.error('No hay configuración de rifa. Contacta al administrador.');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('ticket_purchases')
        .insert({
          raffle_id: raffleConfig.id,
          buyer_name: formData.name,
          buyer_email: formData.email,
          buyer_phone: formData.phone,
          ticket_numbers: assignedNumbers,
          quantity: selectedQuantity,
          total_price: getPrice(),
          payment_status: 'pending',
          payment_method: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving purchase:', error);
        const msg = error.message || 'Error desconocido';
        toast.error(`Error al guardar la compra: ${msg}`);
        setIsLoading(false);
        return;
      }
      
      const purchase: TicketPurchase = {
        id: data.id,
        raffleId: data.raffle_id || '',
        buyerName: data.buyer_name,
        buyerEmail: data.buyer_email,
        buyerPhone: data.buyer_phone,
        ticketNumbers: data.ticket_numbers,
        quantity: data.quantity,
        totalPrice: Number(data.total_price),
        purchaseDate: data.created_at,
        paymentStatus: data.payment_status as 'pending' | 'verified' | 'cancelled',
        paymentMethod: data.payment_method || 'pending'
      };
      
      onPurchaseComplete(purchase);
      toast.success(`¡Compra registrada! Tu pago se está procesando. Tus boletas llegarán a ${purchase.buyerEmail} una vez verificado el pago.`);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(`Error al procesar la compra: ${error?.message || 'Error desconocido'}`);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-accent" />
        Completa tu compra
      </h3>
      
      {/* Información de boletas seleccionadas */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Ticket className="w-5 h-5 text-primary" />
          <span className="font-semibold">Tu selección</span>
        </div>
        
        <div className="text-center py-4">
          <div className="text-4xl font-display font-bold gold-text mb-2">
            {selectedQuantity}
          </div>
          <p className="text-muted-foreground">
            {selectedQuantity === 1 ? 'Boleta' : 'Boletas'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Los números serán asignados automáticamente y enviados a tu correo
          </p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Cantidad:</span>
          <span className="font-semibold">{selectedQuantity} boleta(s)</span>
        </div>
        <div className="border-t border-border my-3" />
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-display gold-text">
            {formatMoney(getPrice(), config.currency)} {config.currency}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Nombre completo
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Tu nombre"
            required
            className="bg-input border-border"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" /> Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="tu@email.com"
            required
            className="bg-input border-border"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" /> Teléfono
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+1 234 567 8900"
            required
            className="bg-input border-border"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full gold-gradient text-primary-foreground font-bold py-6 text-lg hover:opacity-90 transition-opacity"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Procesando...
          </>
        ) : (
          <>Continuar al pago - {formatMoney(getPrice(), config.currency)} {config.currency}</>
        )}
      </Button>
    </form>
  );
}
