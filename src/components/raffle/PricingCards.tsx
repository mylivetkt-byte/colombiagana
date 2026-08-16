import { useRaffleStore } from '@/store/raffleStore';
import { PricingTier } from '@/types/raffle';
import { Ticket, Sparkles, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/format';

interface PricingCardsProps {
  selectedQuantity: number;
  onSelect: (quantity: number) => void;
}

export function PricingCards({ selectedQuantity, onSelect }: PricingCardsProps) {
  const { config } = useRaffleStore();
  
  const tiers: PricingTier[] = [
    {
      quantity: 1,
      price: config.priceOne,
      label: 'Una Boleta'
    },
    {
      quantity: 2,
      price: config.priceTwo,
      label: 'Dos Boletas',
      savings: config.priceOne * 2 > config.priceTwo 
        ? `Ahorras ${formatMoney(config.priceOne * 2 - config.priceTwo, config.currency)}` 
        : undefined
    },
    {
      quantity: 3,
      price: config.priceThree,
      label: 'Tres Boletas',
      savings: config.priceOne * 3 > config.priceThree 
        ? `Ahorras ${formatMoney(config.priceOne * 3 - config.priceThree, config.currency)}` 
        : undefined
    }
  ];

  const icons = [Ticket, Sparkles, Crown];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier, index) => {
        const Icon = icons[index];
        const isSelected = selectedQuantity === tier.quantity;
        const isPopular = tier.quantity === 3;
        
        return (
          <div
            key={tier.quantity}
            onClick={() => onSelect(tier.quantity)}
            className={cn(
              "price-card relative overflow-hidden group",
              isSelected && "price-card-selected",
              isPopular && "md:-mt-4 md:pb-8"
            )}
          >
            {isPopular && (
              <div className="absolute top-0 left-0 right-0 gold-gradient py-1 text-xs font-bold text-primary-foreground">
                MÁS POPULAR
              </div>
            )}
            
            <div className={cn("pt-4", isPopular && "pt-8")}>
              <div className={cn(
                "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                isSelected ? "gold-gradient" : "bg-muted"
              )}>
                <Icon className={cn(
                  "w-8 h-8 transition-colors",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{tier.label}</h3>
              
              <div className="mb-4">
                <span className="text-4xl font-display gold-text">
                  {formatMoney(tier.price, config.currency)}
                </span>
                <span className="text-muted-foreground ml-1">{config.currency}</span>
              </div>
              
              {tier.savings && (
                <div className="inline-block bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium">
                  {tier.savings}
                </div>
              )}
              
              <div className="mt-4 text-sm text-muted-foreground">
                {tier.quantity} número{tier.quantity > 1 ? 's' : ''} aleatorio{tier.quantity > 1 ? 's' : ''}
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
