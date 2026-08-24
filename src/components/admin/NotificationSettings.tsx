import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Bell, BellRing } from 'lucide-react';
import { toast } from 'sonner';

// Clave pública VAPID (segura para exponer en el cliente). Debe coincidir con VAPID_PUBLIC_KEY en el secreto del edge function.
const VAPID_PUBLIC_KEY = 'rrCm9pt6SwLRdvvuExX_-dhz-KKD_aYqx2Q-LXVu8VVeCkDtFTDOSyrnUIex_nYsQ1_e68UjRbKcERkuzfF7HA';

export function NotificationSettings() {
  const [status, setStatus] = useState<'idle' | 'activated' | 'unsupported'>(
    typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
      ? 'idle'
      : 'unsupported'
  );

  const activate = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatus('unsupported');
        toast.error('Este navegador no soporta notificaciones push');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Permiso de notificaciones denegado');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      });

      const { error } = await supabase.functions.invoke('push-subscribe', {
        body: { subscription: sub },
      });
      if (error) throw error;

      setStatus('activated');
      toast.success('Notificaciones activadas. Recibirás avisos de nuevas boletas.');
    } catch (e: any) {
      console.error(e);
      toast.error(`No se pudo activar: ${e?.message || 'error'}`);
    }
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Bell className="w-5 h-5 text-accent" /> Notificaciones push
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Recibe un aviso con sonido en tu celular cuando haya una nueva boleta por verificar, aunque la pantalla esté apagada. Para mejor resultado, instala la app (menú "Añadir a pantalla de inicio" / "Instalar").
      </p>
      {status === 'unsupported' ? (
        <p className="text-sm text-destructive">Tu navegador no soporta notificaciones push.</p>
      ) : (
        <Button
          onClick={activate}
          className="gold-gradient text-primary-foreground gap-2"
          disabled={status === 'activated'}
        >
          {status === 'activated' ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          {status === 'activated' ? 'Notificaciones activadas' : 'Activar notificaciones'}
        </Button>
      )}
    </div>
  );
}
