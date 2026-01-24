import { TicketPurchase } from '@/types/raffle';
import { useRaffleStore } from '@/store/raffleStore';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, CreditCard, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentConfirmationProps {
  purchase: TicketPurchase;
  onBack: () => void;
}

export function PaymentConfirmation({ purchase, onBack }: PaymentConfirmationProps) {
  const { config } = useRaffleStore();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const paymentMethods = [
    {
      name: 'PayPal',
      icon: Wallet,
      info: 'pagos@tudominio.com',
      instructions: 'Envía el pago a esta dirección de PayPal'
    },
    {
      name: 'Transferencia Bancaria',
      icon: CreditCard,
      info: 'Banco: XXXX | Cuenta: 1234567890',
      instructions: 'Realiza la transferencia a esta cuenta'
    }
  ];

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto animate-scale-in">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full gold-gradient flex items-center justify-center animate-pulse-glow">
          <CheckCircle className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">¡Compra Registrada!</h2>
        <p className="text-muted-foreground">
          Tu reserva está pendiente de pago. Completa el pago para confirmar tus boletas.
        </p>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 mb-8">
        <h3 className="font-semibold mb-4">Resumen de tu compra</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rifa:</span>
            <span className="font-medium">{config.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Números:</span>
            <span className="font-display text-primary">
              {purchase.ticketNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cantidad:</span>
            <span>{purchase.quantity} boleta(s)</span>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total a pagar:</span>
            <span className="font-display gold-text">${purchase.totalPrice} {config.currency}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h3 className="font-semibold">Métodos de pago</h3>
        {paymentMethods.map((method, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <method.icon className="w-5 h-5 text-primary" />
              <span className="font-medium">{method.name}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{method.instructions}</p>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
              <code className="flex-1 text-sm">{method.info}</code>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8"
                onClick={() => copyToClipboard(method.info)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-center">
          <strong>Importante:</strong> Una vez realizado el pago, envía el comprobante por WhatsApp.
          Tu boleta será enviada a <strong>{purchase.buyerEmail}</strong> después de verificar el pago.
        </p>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Comprar más boletas
        </Button>
        <Button className="flex-1 gold-gradient text-primary-foreground hover:opacity-90">
          Enviar comprobante
        </Button>
      </div>
    </div>
  );
}
