import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ConfigForm } from '@/components/admin/ConfigForm';
import { SpecialPrizesForm } from '@/components/admin/SpecialPrizesForm';
import { NotificationSettings } from '@/components/admin/NotificationSettings';
import { useRaffleStore } from '@/store/raffleStore';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';

export default function AdminConfig() {
  const { resetRaffle, config } = useRaffleStore();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetRaffle();
      toast.success('Rifa reiniciada. Todos los números están disponibles nuevamente.');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al reiniciar la rifa');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AdminHeader />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configuración</h1>
          <p className="text-muted-foreground">Personaliza tu rifa</p>
        </div>

        <div className="max-w-4xl space-y-6">
          <ConfigForm />

          <NotificationSettings />

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-2">Premios Especiales / Números Premiados</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Asigna premios sorpresa a números específicos. Estos premios se revelarán al público en la página de ganadores cuando los actives.
            </p>
            <SpecialPrizesForm />
          </div>

          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Reiniciar Rifa</h2>
                <p className="text-sm text-muted-foreground">
                  Esta acción eliminará todas las compras y liberará los números vendidos para una nueva rifa.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reiniciar rifa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente todas las compras registradas de la rifa actual.
                      Los números volverán a estar disponibles y deberás volver a configurar los precios y métodos de pago si es necesario.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isResetting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      disabled={isResetting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isResetting ? 'Reiniciando...' : 'Sí, reiniciar'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
