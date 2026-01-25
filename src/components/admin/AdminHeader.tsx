import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, LayoutDashboard, Users, Eye, LogOut } from 'lucide-react';
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
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl gold-text">Panel Admin</span>
        </div>
        
        <nav className="flex items-center gap-2">
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/admin/config">
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Configuración
            </Button>
          </Link>
          <Link to="/admin/purchases">
            <Button variant="ghost" size="sm" className="gap-2">
              <Users className="w-4 h-4" />
              Compradores
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
              <Eye className="w-4 h-4" />
              Ver Rifa
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Salir
          </Button>
        </nav>
      </div>
    </header>
  );
}
