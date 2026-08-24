import { useState, useEffect } from 'react';
import { HeroSection } from '@/components/raffle/HeroSection';
import { PricingCards } from '@/components/raffle/PricingCards';
import { PurchaseForm } from '@/components/raffle/PurchaseForm';
import { PaymentConfirmation } from '@/components/raffle/PaymentConfirmation';
import { SpecificationsSection } from '@/components/raffle/SpecificationsSection';
import { TicketLookup } from '@/components/raffle/TicketLookup';
import { useRaffleStore } from '@/store/raffleStore';
import { TicketPurchase } from '@/types/raffle';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function Index() {
  const [selectedQuantity, setSelectedQuantity] = useState<number | null>(null);
  const [completedPurchase, setCompletedPurchase] = useState<TicketPurchase | null>(null);
  const { config, loadConfig, loadSoldNumbers } = useRaffleStore();

  useEffect(() => {
    loadConfig();
    loadSoldNumbers();
  }, []);

  const handleQuantitySelect = (quantity: number) => {
    setSelectedQuantity(quantity);
    setTimeout(() => {
      document.getElementById('purchase-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePurchaseComplete = (purchase: TicketPurchase) => {
    setCompletedPurchase(purchase);
  };

  const handleNewPurchase = () => {
    setCompletedPurchase(null);
    setSelectedQuantity(null);
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

          {/* Purchase Section - Solo se muestra si se ha seleccionado un plan */}
          {selectedQuantity !== null && (
            <section id="purchase-section" className="py-16 container transition-all animate-fade-in">
              <div className="max-w-lg mx-auto">
                <PurchaseForm
                  selectedQuantity={selectedQuantity}
                  onPurchaseComplete={handlePurchaseComplete}
                />
              </div>
            </section>
          )}

          <TicketLookup />

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

      <ChatWidget />
    </div>
  );
}
