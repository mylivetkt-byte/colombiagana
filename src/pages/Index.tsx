import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '@/components/raffle/HeroSection';
import { PricingCards } from '@/components/raffle/PricingCards';
import { TicketGrid } from '@/components/raffle/TicketGrid';
import { PurchaseForm } from '@/components/raffle/PurchaseForm';
import { PaymentConfirmation } from '@/components/raffle/PaymentConfirmation';
import { SpecificationsSection } from '@/components/raffle/SpecificationsSection';
import { useRaffleStore } from '@/store/raffleStore';
import { TicketPurchase } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { Settings, Shuffle, Ticket } from 'lucide-react';

export default function Index() {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [completedPurchase, setCompletedPurchase] = useState<TicketPurchase | null>(null);
  const { generateRandomNumbers, config } = useRaffleStore();

  const handleQuantitySelect = (quantity: number) => {
    setSelectedQuantity(quantity);
    setSelectedNumbers([]);
  };

  const handleAutoSelect = () => {
    const numbers = generateRandomNumbers(selectedQuantity);
    setSelectedNumbers(numbers);
  };

  const handleNumberToggle = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else if (selectedNumbers.length < selectedQuantity) {
      setSelectedNumbers(prev => [...prev, num]);
    }
  };

  const handlePurchaseComplete = (purchase: TicketPurchase) => {
    setCompletedPurchase(purchase);
  };

  const handleNewPurchase = () => {
    setCompletedPurchase(null);
    setSelectedNumbers([]);
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

          {/* Number Selection */}
          <section className="py-16 container">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Ticket className="w-6 h-6 text-primary" />
                    Selecciona tus números
                  </h2>
                  <Button 
                    onClick={handleAutoSelect}
                    variant="outline"
                    className="gap-2 border-primary/50 hover:bg-primary/10"
                  >
                    <Shuffle className="w-4 h-4" />
                    Aleatorio ({selectedQuantity})
                  </Button>
                </div>
                
                <div className="mb-4 text-sm text-muted-foreground">
                  Seleccionados: {selectedNumbers.length} / {selectedQuantity}
                </div>
                
                <TicketGrid 
                  selectedNumbers={selectedNumbers}
                  onNumberToggle={handleNumberToggle}
                />
              </div>

              <div className="lg:w-96">
                <PurchaseForm
                  selectedQuantity={selectedQuantity}
                  selectedNumbers={selectedNumbers}
                  onPurchaseComplete={handlePurchaseComplete}
                />
              </div>
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
