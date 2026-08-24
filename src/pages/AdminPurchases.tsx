import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PurchasesTable } from '@/components/admin/PurchasesTable';
import { useRaffleStore } from '@/store/raffleStore';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type SentFilter = 'all' | 'sent' | 'pending';

export default function AdminPurchases() {
  const { purchases, loadPurchases } = useRaffleStore();
  const [pendingQuery, setPendingQuery] = useState('');
  const [verifiedQuery, setVerifiedQuery] = useState('');
  const [sentFilter, setSentFilter] = useState<SentFilter>('all');

  useEffect(() => {
    loadPurchases();
  }, []);

  const stats = {
    total: purchases.length,
    pending: purchases.filter(p => p.paymentStatus === 'pending' || p.paymentStatus === 'cancelled').length,
    verified: purchases.filter(p => p.paymentStatus === 'verified').length,
  };

  const match = (p: any, q: string) =>
    !q ||
    p.buyerName.toLowerCase().includes(q.toLowerCase()) ||
    p.buyerEmail.toLowerCase().includes(q.toLowerCase()) ||
    p.buyerPhone.toLowerCase().includes(q.toLowerCase());

  const pendingList = purchases
    .filter(p => p.paymentStatus === 'pending' || p.paymentStatus === 'cancelled')
    .filter(p => match(p, pendingQuery));

  const verifiedList = purchases
    .filter(p => p.paymentStatus === 'verified')
    .filter(p => match(p, verifiedQuery))
    .filter(p => {
      if (sentFilter === 'sent') return !!p.emailSentAt;
      if (sentFilter === 'pending') return !p.emailSentAt;
      return true;
    });

  return (
    <div className="min-h-screen">
      <AdminHeader />
      
      <main className="container py-8 space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Compradores</h1>
          <p className="text-muted-foreground">Verifica pagos y administra las boletas vendidas</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display gold-text">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display text-primary">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Por verificar</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display text-accent">{stats.verified}</div>
            <div className="text-sm text-muted-foreground">Verificados</div>
          </div>
        </div>

        {/* Por verificar */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary inline-block" />
              Por verificar ({pendingList.length})
            </h2>
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, correo o teléfono"
                value={pendingQuery}
                onChange={(e) => setPendingQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {pendingList.length > 0 ? (
            <PurchasesTable purchases={pendingList} />
          ) : (
            <div className="glass-card p-8 text-center text-muted-foreground">
              No hay compras por verificar.
            </div>
          )}
        </section>

        {/* Verificados */}
        <section className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent inline-block" />
              Verificados ({verifiedList.length})
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex rounded-lg overflow-hidden border border-border text-sm">
                {(['all', 'sent', 'pending'] as SentFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSentFilter(f)}
                    className={`px-3 py-2 transition-colors ${
                      sentFilter === f
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {f === 'all' ? 'Todos' : f === 'sent' ? 'Enviados' : 'Sin enviar'}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en verificados"
                  value={verifiedQuery}
                  onChange={(e) => setVerifiedQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          {verifiedList.length > 0 ? (
            <PurchasesTable purchases={verifiedList} />
          ) : (
            <div className="glass-card p-8 text-center text-muted-foreground">
              No hay compras verificadas.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
