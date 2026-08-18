import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PurchasesTable } from '@/components/admin/PurchasesTable';
import { useRaffleStore } from '@/store/raffleStore';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function AdminPurchases() {
  const { purchases, loadPurchases } = useRaffleStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadPurchases();
  }, []);

  const stats = {
    total: purchases.length,
    pending: purchases.filter(p => p.paymentStatus === 'pending').length,
    verified: purchases.filter(p => p.paymentStatus === 'verified').length,
    cancelled: purchases.filter(p => p.paymentStatus === 'cancelled').length
  };

  const filtered = purchases.filter(p =>
    p.buyerName.toLowerCase().includes(query.toLowerCase()) ||
    p.buyerEmail.toLowerCase().includes(query.toLowerCase()) ||
    p.buyerPhone.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <AdminHeader />
      
      <main className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Compradores</h1>
          <p className="text-muted-foreground">Verifica pagos y administra las boletas vendidas</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display gold-text">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display text-primary">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display text-accent">{stats.verified}</div>
            <div className="text-sm text-muted-foreground">Verificados</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display text-destructive">{stats.cancelled}</div>
            <div className="text-sm text-muted-foreground">Cancelados</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, correo o teléfono"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <PurchasesTable purchases={filtered} />
      </main>
    </div>
  );
}
