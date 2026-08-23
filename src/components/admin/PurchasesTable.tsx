import { useState } from 'react';
import { useRaffleStore } from '@/store/raffleStore';
import { TicketPurchase } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Mail, Copy, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export function PurchasesTable({ purchases }: { purchases: TicketPurchase[] }) {
  const { config, updatePurchaseStatus } = useRaffleStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const digitCount = String(config.endNumber).length;

  const handleVerify = (id: string) => {
    updatePurchaseStatus(id, 'verified');
    toast.success('Pago verificado. Abrí el correo para enviar la boleta.');
  };

  const handleCancel = (id: string) => {
    updatePurchaseStatus(id, 'cancelled');
    toast.info('Compra cancelada');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-accent text-accent-foreground">Verificado</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary" className="bg-primary/20 text-primary">Pendiente</Badge>;
    }
  };

  const getEmailStatus = (purchase: TicketPurchase) => {
    if (purchase.paymentStatus !== 'verified') return null;
    if (purchase.emailSentAt) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enviado</Badge>;
    }
    if (purchase.emailError) {
      return <Badge variant="destructive" title={purchase.emailError}>Error</Badge>;
    }
    return <Badge variant="secondary">Pendiente</Badge>;
  };

  const openMailto = (purchase: TicketPurchase) => {
    const raffleTitle = config.title || 'Colombia Gana';
    const ticketNumbers = purchase.ticketNumbers.map(n => String(n).padStart(digitCount, '0')).join(', ');
    const subject = encodeURIComponent(`¡Tus números de rifa! ${raffleTitle}`);
    const body = encodeURIComponent(
      `Hola ${purchase.buyerName},\n\n` +
      `Tus números para la rifa ${raffleTitle} son:\n` +
      `${ticketNumbers}\n\n` +
      `Cantidad: ${purchase.quantity}\n` +
      `Total pagado: ${purchase.totalPrice}\n\n` +
      `Guarda este correo como comprobante. ¡Mucha suerte!`
    );
    window.open(`mailto:${purchase.buyerEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const copyTickets = async (purchase: TicketPurchase) => {
    const ticketNumbers = purchase.ticketNumbers.map(n => String(n).padStart(digitCount, '0')).join(', ');
    await navigator.clipboard.writeText(ticketNumbers);
    toast.success('Números copiados al portapapeles');
  };

  if (purchases.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Sin compras aún</h3>
        <p className="text-muted-foreground">Las compras de boletas aparecerán aquí</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead>Comprador</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Números</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id} className="border-border/50">
                <TableCell className="font-medium">{purchase.buyerName}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{purchase.buyerEmail}</div>
                    <div className="text-muted-foreground">{purchase.buyerPhone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {purchase.ticketNumbers.map(num => (
                      <span key={num} className="font-display text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {num.toString().padStart(digitCount, '0')}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-display gold-text">${purchase.totalPrice}</TableCell>
                <TableCell>
                  {purchase.paymentImageUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedImage(purchase.paymentImageUrl!)}
                      className="gap-1"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Ver
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin comprobante</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(purchase.paymentStatus)}</TableCell>
                <TableCell>{getEmailStatus(purchase)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(purchase.purchaseDate).toLocaleDateString('es-ES')}
                </TableCell>
                <TableCell className="text-right">
                  {purchase.paymentStatus === 'pending' && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent/90"
                        onClick={() => handleVerify(purchase.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verificar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancel(purchase.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                  {purchase.paymentStatus === 'verified' && (
                    <div className="flex gap-2 justify-end">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openMailto(purchase)}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Enviar correo
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyTickets(purchase)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar números
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal para ver comprobante */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comprobante de pago</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Comprobante de pago" 
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
