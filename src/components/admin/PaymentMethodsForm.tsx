import { useState } from 'react';
import { PaymentMethod } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, CreditCard, Building2, Smartphone, Copy } from 'lucide-react';

interface PaymentMethodsFormProps {
  paymentMethods: PaymentMethod[];
  onChange: (methods: PaymentMethod[]) => void;
}

const paymentTypeIcons = {
  bank_transfer: Building2,
  mobile_payment: Smartphone,
  other: CreditCard,
};

const paymentTypeLabels = {
  bank_transfer: 'Transferencia Bancaria',
  mobile_payment: 'Pago Móvil (Nequi, Daviplata, etc.)',
  other: 'Otro',
};

export function PaymentMethodsForm({ paymentMethods, onChange }: PaymentMethodsFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: crypto.randomUUID(),
      name: '',
      type: 'bank_transfer',
      accountNumber: '',
      accountHolder: '',
      bankName: '',
      instructions: '',
      isActive: true,
      qrUrl: '',
    };
    onChange([...paymentMethods, newMethod]);
    setExpandedId(newMethod.id);
  };

  const updateMethod = (id: string, updates: Partial<PaymentMethod>) => {
    onChange(
      paymentMethods.map((method) =>
        method.id === id ? { ...method, ...updates } : method
      )
    );
  };

  const removeMethod = (id: string) => {
    onChange(paymentMethods.filter((method) => method.id !== id));
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyQRUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL del QR copiado');
    });
  };

  return (
    <div className="space-y-4">
      {paymentMethods.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay métodos de pago configurados</p>
          <p className="text-sm">Agrega al menos uno para que los clientes puedan pagar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = paymentTypeIcons[method.type];
            const isExpanded = expandedId === method.id;

            return (
              <div
                key={method.id}
                className="glass-card p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(method.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {method.name || 'Nuevo método de pago'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {paymentTypeLabels[method.type]}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={method.isActive}
                      onCheckedChange={(checked) =>
                        updateMethod(method.id, { isActive: checked })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeMethod(method.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-4 border-t border-border/50 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nombre del Método</Label>
                        <Input
                          value={method.name}
                          onChange={(e) =>
                            updateMethod(method.id, { name: e.target.value })
                          }
                          placeholder="Ej: Bancolombia, Nequi, etc."
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={method.type}
                          onValueChange={(value: PaymentMethod['type']) =>
                            updateMethod(method.id, { type: value })
                          }
                        >
                          <SelectTrigger className="bg-input">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank_transfer">
                              Transferencia Bancaria
                            </SelectItem>
                            <SelectItem value="mobile_payment">
                              Pago Móvil
                            </SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {method.type === 'bank_transfer' && (
                        <div className="space-y-2">
                          <Label>Nombre del Banco</Label>
                          <Input
                            value={method.bankName || ''}
                            onChange={(e) =>
                              updateMethod(method.id, { bankName: e.target.value })
                            }
                            placeholder="Ej: Bancolombia"
                            className="bg-input"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Número de Cuenta / Celular</Label>
                        <Input
                          value={method.accountNumber || ''}
                          onChange={(e) =>
                            updateMethod(method.id, { accountNumber: e.target.value })
                          }
                          placeholder="Ej: 123-456-789 o 300-123-4567"
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Titular de la Cuenta</Label>
                        <Input
                          value={method.accountHolder || ''}
                          onChange={(e) =>
                            updateMethod(method.id, { accountHolder: e.target.value })
                          }
                          placeholder="Nombre completo del titular"
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Instrucciones Adicionales</Label>
                        <Textarea
                          value={method.instructions || ''}
                          onChange={(e) =>
                            updateMethod(method.id, { instructions: e.target.value })
                          }
                          placeholder="Ej: Enviar comprobante al WhatsApp..."
                          className="bg-input"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Código QR (URL)</Label>
                        {method.qrUrl ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={method.qrUrl}
                                onChange={(e) =>
                                  updateMethod(method.id, { qrUrl: e.target.value })
                                }
                                className="bg-input flex-1"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => copyQRUrl(method.qrUrl || '')}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <a 
                                href={method.qrUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button type="button" variant="outline" size="icon">
                                  🔗
                                </Button>
                              </a>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Pega una URL que genere un QR (ej: <code>https://api.qrserver.com/v1/create-qr-code/?data=...</code>)
                            </p>
                          </div>
                        ) : (
                          <>
                            <Input
                              type="url"
                              value={method.qrUrl || ''}
                              onChange={(e) =>
                                updateMethod(method.id, { qrUrl: e.target.value })
                              }
                              placeholder="https://api.qrserver.com/v1/create-qr-code/?data=..."
                              className="bg-input"
                            />
                            <p className="text-xs text-muted-foreground">
                              URL que genere un código QR para mostrar al comprador
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addPaymentMethod}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Agregar Método de Pago
      </Button>
    </div>
  );
}