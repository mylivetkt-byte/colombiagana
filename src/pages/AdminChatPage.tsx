import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminChat } from '@/components/admin/AdminChat';

export default function AdminChatPage() {
  return (
    <div className="min-h-screen">
      <AdminHeader />
      <main className="container py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Chat con compradores</h1>
          <p className="text-muted-foreground">Responde las dudas de tus participantes.</p>
        </div>
        <AdminChat />
      </main>
    </div>
  );
}
