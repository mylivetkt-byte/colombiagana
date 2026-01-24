import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRaffleStore } from '@/store/raffleStore';
import { TicketPurchase } from '@/types/raffle';
import { Loader2, CheckCircle, Mail, Phone, User } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseFormProps {
  selectedQuantity: number;
  selectedNumbers: number[];
  onPurchaseComplete: (purchase: TicketPurchase) => void;
}

export function PurchaseForm({ selectedQuantity, selectedNumbers, onPurchaseComplete }: PurchaseFormProps) {
  const { config, addPurchase } = useRaffleStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const getPrice = () => {
    switch (selectedQuantity) {
      case 1: return config.priceOne;
      case 2: return config.priceTwo;
      case 3: return config.priceThree;
      default: return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedNumbers.length !== selectedQuantity) {
      toast.error(`Debes tener ${selectedQuantity} número(s) seleccionado(s)`);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const purchase: TicketPurchase = {
      id: Date.now().toString(),
      raffleId: config.id,
      buyerName: formData.name,
      buyerEmail: formData.email,
      buyerPhone: formData.phone,
      ticketNumbers: selectedNumbers,
      quantity: selectedQuantity,
      totalPrice: getPrice(),
      purchaseDate: new Date().toISOString(),
      paymentStatus: 'pending',
      paymentMethod: 'pending'
    };
    
    addPurchase(purchase);
    onPurchaseComplete(purchase);
    setIsLoading(false);
    
    toast.success('¡Compra registrada! Procede al pago');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-accent" />
        Completa tu compra
      </h3>
      
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Cantidad:</span>
          <span className="font-semibold">{selectedQuantity} boleta(s)</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-muted-foreground">Números:</span>
          <span className="font-display text-primary">
            {selectedNumbers.map(n => n.toString().padStart(2, '0')).join(', ') || 'Pendiente'}
          </span>
        </div>
        <div className="border-t border-border my-3" />
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-display gold-text">
            ${getPrice()} {config.currency}
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
        disabled={isLoading || selectedNumbers.length !== selectedQuantity}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Procesando...
          </>
        ) : (
          <>Continuar al pago - ${getPrice()} {config.currency}</>
        )}
      </Button>
    </form>
  );
}
