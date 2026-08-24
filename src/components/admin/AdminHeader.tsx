import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, LayoutDashboard, Users, Eye, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function AdminHeader() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="glass-card border-b border-border/50 sticky top-0 z-50">
      <div className="container flex items-center justify-between gap-2 h-16">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gold-gradient flex items-center justify-center">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg sm:text-xl gold-text hidden sm:inline">Panel Admin</span>
        </div>
        
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <Link to="/admin" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Link to="/admin/config" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configuración</span>
            </Button>
          </Link>
          <Link to="/admin/purchases" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Verificados</span>
            </Button>
          </Link>
          <Link to="/admin/chat" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </Button>
          </Link>
          <Link to="/" className="shrink-0">
            <Button variant="outline" size="sm" className="gap-2 px-2 sm:px-3 border-primary/50 text-primary hover:bg-primary/10">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Rifa</span>
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 px-2 sm:px-3 text-destructive hover:bg-destructive/10 shrink-0"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
