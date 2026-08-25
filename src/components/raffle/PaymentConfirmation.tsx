import { formatMoney } from '@/lib/format';
import { useState, useRef } from 'react';
import { TicketPurchase, PaymentMethod } from '@/types/raffle';
import { useRaffleStore } from '@/store/raffleStore';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, CreditCard, Wallet, Building2, Smartphone, Upload, Loader2, Image as ImageIcon, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentConfirmationProps {
  purchase: TicketPurchase;
  onBack: () => void;
}

export function PaymentConfirmation({ purchase, onBack }: PaymentConfirmationProps) {
  const { config } = useRaffleStore();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copiado al portapapeles');
    });
  };

  const copyAccountNumber = (method: PaymentMethod) => {
    if (method.accountNumber) {
      copyToClipboard(method.accountNumber);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar 5MB');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedImage) {
      toast.error('Debes cargar el comprobante de pago');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${purchase.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, selectedImage);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Error al subir el comprobante');
        setIsUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase.rpc('submit_payment_proof', {
        p_purchase_id: purchase.id,
        p_image_url: publicUrl
      });

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error('Error al guardar el comprobante');
        setIsUploading(false);
        return;
      }

      toast.success('¡Comprobante enviado! Te notificaremos cuando sea verificado.');
      removeImage();
      onBack();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar el comprobante');
    } finally {
      setIsUploading(false);
    }
  };

  const activePaymentMethods = config.paymentMethods?.filter(pm => pm.isActive) || [];

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer': return Building2;
      case 'mobile_payment': return Smartphone;
      default: return CreditCard;
    }
  };

  const getPaymentInfo = (method: typeof activePaymentMethods[0]) => {
    if (method.type === 'bank_transfer') {
      return {
        bank: method.bankName || '',
        account: method.accountNumber || '',
        holder: method.accountHolder || ''
      };
    }
    return {
      label: method.name || '',
      account: method.accountNumber || '',
      holder: method.accountHolder || ''
    };
  };

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto animate-scale-in">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full gold-gradient flex items-center justify-center animate-pulse-glow">
          <CheckCircle className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">¡Compra Registrada!</h2>
        <p className="text-muted-foreground">
          Tu reserva está pendiente de pago. Completa el pago y sube tu comprobante para confirmar tus boletas.
        </p>
      </div>

      <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl p-4 mb-8 animate-fade-in">
        <Loader2 className="w-5 h-5 text-primary mt-0.5 animate-spin shrink-0" />
        <p className="text-sm leading-relaxed">
          <strong>Tu pago se está procesando.</strong> En cuanto sea verificado, tus boletas llegarán automáticamente a{' '}
          <strong>{purchase.buyerEmail}</strong>.
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
            <span className="text-muted-foreground">Cantidad:</span>
            <span>{purchase.quantity} boleta(s)</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Correo:</span>
            <span className="font-medium break-all text-right">{purchase.buyerEmail}</span>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total a pagar:</span>
            <span className="font-display gold-text">{formatMoney(purchase.totalPrice, config.currency)} {config.currency}</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-center text-muted-foreground">
            📧 Tus números serán enviados a <strong>{purchase.buyerEmail}</strong> una vez verificado el pago.
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h3 className="font-semibold">Métodos de pago</h3>
        {activePaymentMethods.length > 0 ? (
          activePaymentMethods.map((method) => {
            const IconComponent = getPaymentIcon(method.type);
            const info = getPaymentInfo(method);
            const isBankTransfer = method.type === 'bank_transfer';

            return (
              <div key={method.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{method.name}</h4>
                    <p className="text-sm text-muted-foreground">{method.type === 'bank_transfer' ? 'Transferencia Bancaria' : 'Pago Móvil'}</p>
                  </div>
                </div>

                {method.instructions && (
                  <p className="text-sm text-muted-foreground mb-3">{method.instructions}</p>
                )}

                <div className="space-y-3">
                  
                  {/* Información de cuenta - mobile-first responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Información del titular y cuenta */}
                    <div className="space-y-2">
                      {isBankTransfer && info.bank && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Banco:</span>
                          <span className="text-sm font-medium">{info.bank}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Titular:</span>
                        <span className="text-sm font-medium">{info.holder}</span>
                      </div>
                    </div>

                    {/* Información de cuenta con botón de copia */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Cuenta:</span>
                        <code className="flex-1 text-sm font-mono break-all bg-muted rounded px-2 py-1">{info.account}</code>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          onClick={() => copyAccountNumber(method)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Código QR si está disponible */}
                  {method.qrImageUrl && (
                    <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={method.qrImageUrl} 
                          alt="Código QR" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Pago rápido</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(method.qrImageUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Ver QR
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-muted/50 rounded-xl p-4 text-center text-muted-foreground">
            No hay métodos de pago configurados. Contacta al administrador.
          </div>
        )}
      </div>

      {/* Subida de comprobante */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Subir comprobante de pago
        </h3>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {!selectedImage ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <span className="text-muted-foreground">Clic para seleccionar imagen</span>
              <span className="text-xs text-muted-foreground">Máximo 5MB</span>
            </div>
          </Button>
        ) : (
          <div className="relative">
            <img
              src={previewUrl!}
              alt="Comprobante de pago"
              className="w-full h-48 object-cover rounded-xl border border-border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-center">
          <strong>Importante:</strong> Sube tu comprobante de pago para que podamos verificarlo.
          Tu boleta será enviada a <strong>{purchase.buyerEmail}</strong> después de la verificación.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isUploading}>
          Comprar más boletas
        </Button>
        <Button 
          onClick={handleSubmitPayment}
          disabled={!selectedImage || isUploading}
          className="flex-1 gold-gradient text-primary-foreground hover:opacity-90"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Enviar comprobante
            </>
          )}
        </Button>
      </div>
    </div>
  );
}