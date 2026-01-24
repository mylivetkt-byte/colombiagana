import { useRaffleStore } from '@/store/raffleStore';
import { CheckCircle2, Info } from 'lucide-react';

export function SpecificationsSection() {
  const { config } = useRaffleStore();

  return (
    <section className="py-16">
      <div className="container">
        <div className="glass-card p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
              <Info className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Especificaciones del Sorteo</h2>
          </div>
          
          <ul className="space-y-4">
            {config.specifications.map((spec, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{spec}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20">
            <p className="text-sm text-center text-muted-foreground">
              Al participar aceptas los términos y condiciones del sorteo.
              <br />
              Cualquier duda, contáctanos por nuestras redes sociales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
