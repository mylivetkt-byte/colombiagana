import { useRaffleStore } from '@/store/raffleStore';
import { PricingPlan } from '@/types/raffle';
import { Ticket, Sparkles, Crown, Zap, Flame, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/format';

interface PricingCardsProps {
  selectedQuantity: number;
  onSelect: (quantity: number) => void;
}

export function PricingCards({ selectedQuantity, onSelect }: PricingCardsProps) {
  const { config } = useRaffleStore();

  const plans: PricingPlan[] = (config.plans && config.plans.length > 0)
    ? config.plans
    : [
        { id: '1', quantity: 1, price: config.priceOne || 2000, label: 'Una Boleta' },
        { id: '2', quantity: 2, price: config.priceTwo || 4000, label: 'Dos Boletas' },
        { id: '3', quantity: 3, price: config.priceThree || 8000, label: 'Tres Boletas', isPopular: true },
      ];

  // Encontrar el precio unitario base (por 1 boleta) si existe
  const singlePlan = plans.find(p => p.quantity === 1);
  const baseUnitPrice = singlePlan ? singlePlan.price : (plans[0] ? plans[0].price / plans[0].quantity : 0);

  const icons = [Ticket, Sparkles, Crown, Zap, Flame, Gift];

  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1 max-w-sm mx-auto";
    if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto";
    if (count === 3) return "grid-cols-1 md:grid-cols-3";
    if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  return (
    <div className={cn("grid gap-6", getGridClass(plans.length))}>
      {plans.map((plan, index) => {
        const Icon = icons[index % icons.length];
        const isSelected = selectedQuantity === plan.quantity;
        const isPopular = !!plan.isPopular;
        
        // Calcular ahorro si aplica
        const expectedPrice = baseUnitPrice * plan.quantity;
        const savingsAmount = expectedPrice > plan.price ? expectedPrice - plan.price : 0;
        const savingsText = savingsAmount > 0 
          ? `Ahorras ${formatMoney(savingsAmount, config.currency)}`
          : undefined;

        const displayLabel = plan.label || `${plan.quantity} ${plan.quantity === 1 ? 'Boleta' : 'Boletas'}`;

        return (
          <div
            key={plan.id || plan.quantity}
            onClick={() => onSelect(plan.quantity)}
            className={cn(
              "price-card relative overflow-hidden group cursor-pointer transition-all",
              isSelected && "price-card-selected",
              isPopular && "md:-mt-2 md:pb-6"
            )}
          >
            {isPopular && (
              <div className="absolute top-0 left-0 right-0 gold-gradient py-1 text-xs font-bold text-primary-foreground text-center">
                MÁS POPULAR
              </div>
            )}
            
            <div className={cn("pt-4 text-center", isPopular && "pt-8")}>
              <div className={cn(
                "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                isSelected ? "gold-gradient" : "bg-muted"
              )}>
                <Icon className={cn(
                  "w-8 h-8 transition-colors",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{displayLabel}</h3>
              
              <div className="mb-4">
                <span className="text-4xl font-display gold-text">
                  {formatMoney(plan.price, config.currency)}
                </span>
                <span className="text-muted-foreground ml-1">{config.currency}</span>
              </div>
              
              {savingsText && (
                <div className="inline-block bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium mb-2">
                  {savingsText}
                </div>
              )}
              
              <div className="mt-4 text-sm text-muted-foreground">
                {plan.quantity} número{plan.quantity > 1 ? 's' : ''} aleatorio{plan.quantity > 1 ? 's' : ''}
              </div>
            </div>
            
            {isSelected && (
              <div className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
}

