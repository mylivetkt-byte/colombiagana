import { useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { PurchasesTable } from '@/components/admin/PurchasesTable';
import { TicketGrid } from '@/components/raffle/TicketGrid';
import { useRaffleStore } from '@/store/raffleStore';

export default function Admin() {
  const { soldNumbers, purchases, loadPurchases, loadConfig } = useRaffleStore();

  useEffect(() => {
    loadConfig();
    loadPurchases();
  }, []);


  return (
    <div className="min-h-screen">
      <AdminHeader />
      
      <main className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Vista general de tu rifa</p>
        </div>

        <DashboardStats />

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">
              Por verificar ({purchases.filter((p) => p.paymentStatus === 'pending').length})
            </h2>
            <PurchasesTable
              purchases={purchases.filter((p) => p.paymentStatus === 'pending')}
            />
          </div>
           
          <div>
            <h2 className="text-xl font-bold mb-4">Estado de Boletas</h2>
            <TicketGrid 
              selectedNumbers={soldNumbers}
              interactive={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
