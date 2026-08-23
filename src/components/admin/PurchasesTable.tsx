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
  import { supabase } from '@/integrations/supabase/client';

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

    const sendTicketEmail = async (purchase: TicketPurchase) => {
      const apiKey = config.brevoApiKey;
      const senderEmail = config.brevoSenderEmail;
      const senderName = config.brevoSenderName;

      if (!apiKey || !senderEmail) {
        toast.error('Configura las credenciales de Brevo en la sección Configuración General');
        return;
      }

      const ticketNumbers = purchase.ticketNumbers.map(n => String(n).padStart(digitCount, '0')).join(', ');
      const subject = `¡Tus números de rifa! ${config.title || 'Colombia Gana'}`;
      const htmlContent = `
        <h2>¡Felicidades! Tu pago ha sido verificado</h2>
        <p>Hola <strong>${purchase.buyerName}</strong>,</p>
        <p>Tus números para la rifa <strong>${config.title || 'Colombia Gana'}</strong> son:</p>
        <p style="font-size:20px; font-weight:bold; letter-spacing:1px; color:#d4af37;">${ticketNumbers}</p>
        <p>Cantidad: <strong>${purchase.quantity}</strong></p>
        <p>Total pagado: <strong>${purchase.totalPrice}</strong></p>
        <p>Guarda este correo como comprobante. ¡Mucha suerte!</p>
      `;

      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: senderName || 'ColombiaGana', email: senderEmail },
            to: [{ email: purchase.buyerEmail, name: purchase.buyerName }],
            subject,
            htmlContent
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Brevo ${response.status}: ${errorText}`);
        }

        await supabase
          .from('ticket_purchases')
          .update({ email_sent_at: new Date().toISOString(), email_error: null })
          .eq('id', purchase.id);

        toast.success('Correo enviado exitosamente');
      } catch (error: any) {
        console.error('Error sending email:', error);
        await supabase
          .from('ticket_purchases')
          .update({ email_error: error.message })
          .eq('id', purchase.id);
        toast.error(`No se pudo enviar el correo: ${error.message}`);
      }
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
                        onClick={() => sendTicketEmail(purchase)}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Enviar correo
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          const ticketNumbers = purchase.ticketNumbers.map(n => String(n).padStart(digitCount, '0')).join(', ');
                          navigator.clipboard.writeText(ticketNumbers);
                          toast.success('Números copiados al portapapeles');
                        }}
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
