import { useRaffleStore } from '@/store/raffleStore';
import { Ticket, DollarSign, Users, TrendingUp } from 'lucide-react';

export function DashboardStats() {
  const { config, purchases, soldNumbers } = useRaffleStore();
  
  const totalRevenue = purchases
    .filter(p => p.paymentStatus === 'verified')
    .reduce((sum, p) => sum + p.totalPrice, 0);
  
  const pendingRevenue = purchases
    .filter(p => p.paymentStatus === 'pending')
    .reduce((sum, p) => sum + p.totalPrice, 0);
  
  const stats = [
    {
      label: 'Boletas Vendidas',
      value: soldNumbers.length,
      total: config.totalNumbers,
      icon: Ticket,
      color: 'from-primary to-gold-dark'
    },
    {
      label: 'Ingresos Verificados',
      value: `$${totalRevenue}`,
      subtitle: `${purchases.filter(p => p.paymentStatus === 'verified').length} compras`,
      icon: DollarSign,
      color: 'from-accent to-emerald-600'
    },
    {
      label: 'Pendientes',
      value: `$${pendingRevenue}`,
      subtitle: `${purchases.filter(p => p.paymentStatus === 'pending').length} por verificar`,
      icon: Users,
      color: 'from-secondary to-navy-light'
    },
    {
      label: 'Tasa de Conversión',
      value: `${((soldNumbers.length / config.totalNumbers) * 100).toFixed(1)}%`,
      subtitle: 'del total vendido',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="glass-card p-6 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
          
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
            <stat.icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="text-3xl font-display gold-text mb-1">
            {stat.value}
            {stat.total && (
              <span className="text-lg text-muted-foreground font-sans">/{stat.total}</span>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">{stat.label}</div>
          {stat.subtitle && (
            <div className="text-xs text-muted-foreground/70 mt-1">{stat.subtitle}</div>
          )}
        </div>
      ))}
    </div>
  );
}
