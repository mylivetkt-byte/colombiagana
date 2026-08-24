import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRaffleStore } from '@/store/raffleStore';
import { Button } from '@/components/ui/button';
import { Trophy, Gift, DollarSign, ArrowLeft, Ticket, Sparkles, Smile, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/format';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function Winners() {
  const { config, specialPrizes, purchases, loadSpecialPrizes, loadPurchases, loadConfig } = useRaffleStore();

  useEffect(() => {
    loadConfig();
    loadSpecialPrizes();
    loadPurchases();
  }, []);

  // Filtrar solo los premios que el admin decidió activar/mostrar al público
  const activePrizes = specialPrizes.filter(p => p.isActive);

  // Buscar quién compró el número ganador
  const getWinnerForTicket = (ticketNumber: number) => {
    const purchase = purchases.find(p => 
      p.paymentStatus === 'verified' && p.ticketNumbers.includes(ticketNumber)
    );
    return purchase ? purchase.buyerName : null;
  };

  // Función para enmascarar el nombre y proteger privacidad (ej: Juan Pérez -> J*** P***)
  const maskName = (name: string | null) => {
    if (!name) return 'Por reclamar / No vendido';
    const parts = name.trim().split(/\s+/);
    return parts
      .map((part, idx) => {
        if (idx > 1) return ''; // Solo mostrar primer nombre y primer apellido
        if (part.length <= 2) return part;
        return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
      })
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-navy/10 to-background py-12 relative overflow-hidden">
      {/* Background lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10 max-w-5xl">
        {/* Navigation / Back Button */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Volver a la Rifa
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 animate-bounce">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">SORTEO ESPECIAL</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight">
            🎉 <span className="gold-text">Premios Ganadores</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Aquí se revelan los números ganadores y los premios adicionales del sorteo. ¡Felicidades a todos!
          </p>
        </div>

        {/* Content */}
        {activePrizes.length === 0 ? (
          <div className="glass-card max-w-xl mx-auto p-12 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">¡Próximamente!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Los premios especiales y números ganadores de esta rifa serán publicados en esta página cuando el sorteo haya finalizado. ¡Mantén tus boletas guardadas!
              </p>
            </div>
            <Link to="/">
              <Button className="gold-gradient text-primary-foreground mt-4">
                Comprar más boletas
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activePrizes.map((prize, idx) => {
              const winnerName = getWinnerForTicket(prize.ticketNumber);
              const isClaimed = !!winnerName;

              return (
                <div
                  key={prize.id}
                  className="animate-fade-in group relative"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  {/* Decorative Glow for Winner Card */}
                  {isClaimed && (
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
                  )}

                  {/* Boleto con estilo dentado simulado */}
                  <div className="relative bg-background border border-border/80 rounded-2xl overflow-hidden shadow-xl flex">
                    {/* Left notch section (El boleto numérico) */}
                    <div className="w-24 sm:w-32 bg-muted/30 border-r border-dashed border-border p-4 flex flex-col items-center justify-center relative select-none shrink-0">
                      {/* Círculos de corte de boleto arriba y abajo */}
                      <div className="absolute -top-3 right-[-12px] w-6 h-6 rounded-full bg-background border border-border" />
                      <div className="absolute -bottom-3 right-[-12px] w-6 h-6 rounded-full bg-background border border-border" />
                      
                      <Ticket className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Número</span>
                      <div className="font-display font-extrabold text-3xl gold-text mt-1">
                        {prize.ticketNumber}
                      </div>
                    </div>

                    {/* Right prize details section */}
                    <div className="flex-1 min-w-0 p-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {prize.prizeType === 'money' ? (
                            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-accent/15 text-accent">
                              <DollarSign className="w-3 h-3" /> Efectivo
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-primary/15 text-primary">
                              <Gift className="w-3 h-3" /> Artículo
                            </span>
                          )}
                          
                          {isClaimed ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                              Reclamado
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                              Disponible
                            </span>
                          )}
                        </div>

                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-snug break-words">
                          {prize.prizeDescription}
                        </h3>
                        {prize.prizeType === 'money' && prize.prizeAmount && (
                          <div className="text-sm font-semibold text-muted-foreground">
                            Valor: {formatMoney(prize.prizeAmount, config.currency)} {config.currency}
                          </div>
                        )}
                      </div>

                      {/* Winner Info Block */}
                      <div className="pt-3 border-t border-border/40 flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          isClaimed ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"
                        )}>
                          {isClaimed ? <Crown className="w-4 h-4" /> : <Smile className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">
                            Ganador de la boleta
                          </div>
                          <div className="text-sm font-bold truncate">
                            {maskName(winnerName)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ChatWidget />
    </div>
  );
}
