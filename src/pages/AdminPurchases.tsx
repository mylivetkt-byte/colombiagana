import { AdminHeader } from '@/components/admin/AdminHeader';
import { PurchasesTable } from '@/components/admin/PurchasesTable';
import { useRaffleStore } from '@/store/raffleStore';

export default function AdminPurchases() {
  const { purchases } = useRaffleStore();

  const stats = {
    total: purchases.length,
    pending: purchases.filter(p => p.paymentStatus === 'pending').length,
    verified: purchases.filter(p => p.paymentStatus === 'verified').length,
    cancelled: purchases.filter(p => p.paymentStatus === 'cancelled').length
  };

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

        <PurchasesTable />
      </main>
    </div>
  );
}
