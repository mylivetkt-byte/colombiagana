import { AdminHeader } from '@/components/admin/AdminHeader';
import { ConfigForm } from '@/components/admin/ConfigForm';

export default function AdminConfig() {
  return (
    <div className="min-h-screen">
      <AdminHeader />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configuración</h1>
          <p className="text-muted-foreground">Personaliza tu rifa</p>
        </div>

        <div className="max-w-4xl">
          <ConfigForm />
        </div>
      </main>
    </div>
  );
}
