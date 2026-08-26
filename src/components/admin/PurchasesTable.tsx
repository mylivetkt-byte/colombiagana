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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Clock, Mail, Copy, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function PurchasesTable({ purchases }: { purchases: TicketPurchase[] }) {
  const { config, updatePurchaseStatus, loadPurchases, deletePurchase } = useRaffleStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const digitCount = String(config.endNumber).length;

  const handleVerify = (id: string) => {
    updatePurchaseStatus(id, 'verified');
    toast.success('Pago verificado. Abrí el correo para enviar la boleta.');
  };

  const handleDelete = async (id: string) => {
    const success = await deletePurchase(id);
    if (success) {
      toast.success('Compra eliminada. Los números vuelven a estar disponibles.');
    } else {
      toast.error('Error al eliminar la compra');
    }
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
    try {
      const brevoApiKey = config.brevoApiKey;
      if (!brevoApiKey) {
        toast.error('No hay BREVO_API_KEY configurada. Agrégala en Configuración.');
        return;
      }

      const digitCountLocal = String(config.endNumber).length;
      const ticketNumbers = purchase.ticketNumbers
        .map((n) => String(n).padStart(digitCountLocal, '0'))
        .join(', ');
      const eventName = config.title || 'Colombia Gana';
      const senderEmail = config.brevoSenderEmail || 'noreply@colombiaga.com';
      const senderName = config.brevoSenderName || 'Colombia Gana';

      const emailHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tus números de rifa</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f6f6f6; font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:24px 0;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
            <tr>
              <td style="background: linear-gradient(90deg, #d4af37, #fcd34d); padding:20px 24px; text-align:center;">
                <h1 style="margin:0; font-size:22px; color:#111827;">Colombia Gana</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <h2 style="margin:0 0 12px; font-size:18px; color:#111827;">¡Felicidades! Tu pago ha sido verificado</h2>
                <p style="margin:0 0 12px; font-size:14px; color:#374151;">Hola <strong>${purchase.buyerName}</strong>,</p>
                <p style="margin:0 0 12px; font-size:14px; color:#374151;">Tus números para la rifa <strong>${eventName}</strong> son:</p>
                <p style="margin:16px 0; font-size:20px; font-weight:bold; letter-spacing:1px; color:#d4af37;">${ticketNumbers}</p>
                <p style="margin:0 0 8px; font-size:14px; color:#374151;">Cantidad: <strong>${purchase.quantity}</strong></p>
                <p style="margin:0 0 8px; font-size:14px; color:#374151;">Total pagado: <strong>${purchase.totalPrice}</strong></p>
                <p style="margin:16px 0 0; font-size:12px; color:#6b7280;">Guarda este correo como comprobante. ¡Mucha suerte!</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
      `;

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: purchase.buyerEmail, name: purchase.buyerName }],
          subject: `¡Tus números de rifa! ${eventName}`,
          htmlContent: emailHtml,
        }),
      });

      const responseText = await response.text();
      if (!response.ok) {
        console.error('Brevo error', response.status, responseText);
        await supabase
          .from('ticket_purchases')
          .update({ email_error: `Brevo ${response.status}: ${responseText}` })
          .eq('id', purchase.id);
        throw new Error(`Brevo ${response.status}`);
      }

      await supabase
        .from('ticket_purchases')
        .update({ email_sent_at: new Date().toISOString(), email_error: null })
        .eq('id', purchase.id);

      toast.success('Correo enviado exitosamente');
      loadPurchases();
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(`No se pudo enviar el correo: ${error?.message || 'Error desconocido'}`);
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

  const renderActions = (purchase: TicketPurchase) => {
    if (purchase.paymentStatus === 'pending') {
      return (
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            className="bg-accent hover:bg-accent/90 w-full"
            onClick={() => handleVerify(purchase.id)}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Verificar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="w-full"
            onClick={() => handleCancel(purchase.id)}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
        </div>
      );
    }

    if (purchase.paymentStatus === 'verified') {
      return (
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => sendTicketEmail(purchase)}
          >
            <Mail className="w-4 h-4 mr-1" />
            Enviar correo
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full"
            onClick={() => {
              const ticketNumbers = purchase.ticketNumbers.map((n: number) => String(n).padStart(digitCount, '0')).join(', ');
              navigator.clipboard.writeText(ticketNumbers);
              toast.success('Números copiados al portapapeles');
            }}
          >
            <Copy className="w-4 h-4 mr-1" />
            Copiar números
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar esta compra?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Los números {purchase.ticketNumbers.map((n: number) => String(n).padStart(digitCount, '0')).join(', ')} volverán a estar disponibles.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(purchase.id)} className="bg-destructive hover:bg-destructive/90">
                  Sí, eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => handleVerify(purchase.id)}
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        Reactivar
      </Button>
    );
  };

  const renderComprobante = (purchase: TicketPurchase) =>
    purchase.paymentImageUrl ? (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSelectedImage(purchase.paymentImageUrl!)}
        className="gap-1 w-full sm:w-auto"
      >
        <ImageIcon className="w-4 h-4" />
        Ver
      </Button>
    ) : (
      <span className="text-xs text-muted-foreground">Sin comprobante</span>
    );

  return (
    <>
      {/* Vista móvil: tarjetas */}
      <div className="md:hidden space-y-3">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="glass-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{purchase.buyerName}</div>
                <div className="text-xs text-muted-foreground truncate">{purchase.buyerEmail}</div>
                <div className="text-xs text-muted-foreground">{purchase.buyerPhone}</div>
              </div>
              {getStatusBadge(purchase.paymentStatus)}
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Números</div>
              <div className="flex gap-1 flex-wrap">
                {purchase.ticketNumbers.map((num) => (
                  <span key={num} className="font-display text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">
                    {num.toString().padStart(digitCount, '0')}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-display gold-text">{purchase.totalPrice}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fecha:</span>
              <span>{new Date(purchase.purchaseDate).toLocaleDateString('es-ES')}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Comprobante:</span>
              {renderComprobante(purchase)}
            </div>

            {purchase.paymentStatus === 'verified' && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Correo:</span>
                <span>{getEmailStatus(purchase)}</span>
              </div>
            )}

            {renderActions(purchase)}
          </div>
        ))}
      </div>

      {/* Vista escritorio: tabla */}
      <div className="hidden md:block glass-card overflow-hidden">
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
                    {purchase.ticketNumbers.map((num) => (
                      <span key={num} className="font-display text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {num.toString().padStart(digitCount, '0')}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-display gold-text">${purchase.totalPrice}</TableCell>
                <TableCell>{renderComprobante(purchase)}</TableCell>
                <TableCell>{getStatusBadge(purchase.paymentStatus)}</TableCell>
                <TableCell>{getEmailStatus(purchase)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(purchase.purchaseDate).toLocaleDateString('es-ES')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">{renderActions(purchase)}</div>
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
