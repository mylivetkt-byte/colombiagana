import { useRaffleStore } from '@/store/raffleStore';
import { Calendar, Trophy, Ticket } from 'lucide-react';
import { Countdown } from './Countdown';
import { ShareRaffle } from './ShareRaffle';

export function HeroSection() {
  const { config, soldNumbers } = useRaffleStore();
  const totalNumbers = config.endNumber - config.startNumber + 1;
  const availableCount = totalNumbers - soldNumbers.length;
  const soldPercentage = (soldNumbers.length / totalNumbers) * 100;

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Banner Background */}
      {config.bannerImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${config.bannerImage})` }}
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
        </div>
      )}
      
      {/* Fallback background effects */}
      {!config.bannerImage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-navy/30" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </>
      )}
      
      <div className="container relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">SORTEO ACTIVO</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-fade-in">
            <span className="gold-text">{config.title}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
            {config.description}
          </p>
          
          {/* Prize Image */}
          {config.prizeImage && (
            <div className="mb-8 animate-scale-in">
              <div className="glass-card p-2 inline-block rounded-2xl overflow-hidden">
                <img 
                  src={config.prizeImage} 
                  alt={config.prize}
                  loading="lazy"
                  onError={(e) => { (e.currentTarget.parentElement?.parentElement as HTMLElement).style.display = 'none'; }}
                  className="max-h-64 md:max-h-80 w-auto object-contain rounded-xl"
                />
              </div>
            </div>
          )}
          
          <div className="glass-card inline-block px-8 py-6 mb-10 animate-scale-in">
            <div className="text-sm text-muted-foreground mb-2">PREMIO</div>
            <div className="text-2xl md:text-3xl font-bold gold-text">
              {config.prize}
            </div>
          </div>

          <Countdown date={config.drawDate} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">

            <div className="glass-card p-4">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Fecha del sorteo</div>
              <div className="font-semibold">
                {new Date(config.drawDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
            
            <div className="glass-card p-4">
              <Ticket className="w-6 h-6 text-accent mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Boletas disponibles</div>
              <div className="font-display text-xl gold-text">
                {availableCount} / {totalNumbers}
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="text-sm text-muted-foreground mb-2">Progreso</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full gold-gradient transition-all duration-500"
                  style={{ width: `${soldPercentage}%` }}
                />
              </div>
              <div className="text-sm mt-1 font-medium">{soldPercentage.toFixed(0)}% vendido</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
