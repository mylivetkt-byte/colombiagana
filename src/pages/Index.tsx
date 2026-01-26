import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '@/components/raffle/HeroSection';
import { PricingCards } from '@/components/raffle/PricingCards';
import { PurchaseForm } from '@/components/raffle/PurchaseForm';
import { PaymentConfirmation } from '@/components/raffle/PaymentConfirmation';
import { SpecificationsSection } from '@/components/raffle/SpecificationsSection';
import { useRaffleStore } from '@/store/raffleStore';
import { TicketPurchase } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export default function Index() {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [completedPurchase, setCompletedPurchase] = useState<TicketPurchase | null>(null);
  const { config, loadConfig, loadPurchases } = useRaffleStore();

  useEffect(() => {
    loadConfig();
    loadPurchases();
  }, []);

  const handleQuantitySelect = (quantity: number) => {
    setSelectedQuantity(quantity);
  };

  const handlePurchaseComplete = (purchase: TicketPurchase) => {
    setCompletedPurchase(purchase);
  };

  const handleNewPurchase = () => {
    setCompletedPurchase(null);
    setSelectedQuantity(1);
  };

  if (completedPurchase) {
    return (
      <div className="min-h-screen py-20">
        <div className="container">
          <PaymentConfirmation purchase={completedPurchase} onBack={handleNewPurchase} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Admin Link */}
      <div className="fixed top-4 right-4 z-50">
        <Link to="/admin">
          <Button variant="outline" size="sm" className="gap-2 border-primary/30 bg-background/80 backdrop-blur">
            <Settings className="w-4 h-4" />
            Admin
          </Button>
        </Link>
      </div>

      <HeroSection />

      {config.isActive ? (
        <>
          {/* Pricing Section */}
          <section className="py-16 container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Escoge tu plan</h2>
              <p className="text-muted-foreground text-lg">
                ¡Mientras más boletas, más oportunidades de ganar!
              </p>
            </div>
            <PricingCards selectedQuantity={selectedQuantity} onSelect={handleQuantitySelect} />
          </section>

          {/* Purchase Section */}
          <section className="py-16 container">
            <div className="max-w-lg mx-auto">
              <PurchaseForm
                selectedQuantity={selectedQuantity}
                onPurchaseComplete={handlePurchaseComplete}
              />
            </div>
          </section>

          <SpecificationsSection />
        </>
      ) : (
        <section className="py-20 container text-center">
          <div className="glass-card p-12 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Sorteo no disponible</h2>
            <p className="text-muted-foreground">
              Este sorteo aún no está activo. Vuelve pronto para participar.
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Sistema de Rifas. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
