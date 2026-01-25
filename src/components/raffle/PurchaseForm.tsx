import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRaffleStore } from '@/store/raffleStore';
import { TicketPurchase } from '@/types/raffle';
import { Loader2, CheckCircle, Mail, Phone, User, Shuffle, Ticket } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseFormProps {
  selectedQuantity: number;
  onPurchaseComplete: (purchase: TicketPurchase) => void;
}

export function PurchaseForm({ selectedQuantity, onPurchaseComplete }: PurchaseFormProps) {
  const { config, addPurchase, generateRandomNumbers } = useRaffleStore();
  const [isLoading, setIsLoading] = useState(false);
  const [assignedNumbers, setAssignedNumbers] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Generar números aleatorios cuando cambia la cantidad
  useEffect(() => {
    const numbers = generateRandomNumbers(selectedQuantity);
    setAssignedNumbers(numbers);
  }, [selectedQuantity, generateRandomNumbers]);

  const handleRegenerateNumbers = () => {
    const numbers = generateRandomNumbers(selectedQuantity);
    setAssignedNumbers(numbers);
    toast.success('¡Nuevos números asignados!');
  };

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
    
    if (assignedNumbers.length !== selectedQuantity) {
      toast.error(`Error al asignar números. Intenta de nuevo.`);
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
      ticketNumbers: assignedNumbers,
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
      
      {/* Números asignados */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            <span className="font-semibold">Tus números asignados</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRegenerateNumbers}
            className="gap-2 border-primary/50 hover:bg-primary/10"
          >
            <Shuffle className="w-4 h-4" />
            Cambiar
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center">
          {assignedNumbers.map((num) => (
            <div
              key={num}
              className="w-16 h-16 rounded-xl gold-gradient flex items-center justify-center shadow-lg"
            >
              <span className="text-xl font-display font-bold text-primary-foreground">
                {num.toString().padStart(4, '0')}
              </span>
            </div>
          ))}
        </div>
        
        {assignedNumbers.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No hay números disponibles
          </div>
        )}
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
        disabled={isLoading || assignedNumbers.length !== selectedQuantity}
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
