import { useRaffleStore } from '@/store/raffleStore';
import { cn } from '@/lib/utils';

interface TicketGridProps {
  selectedNumbers: number[];
  onNumberToggle?: (number: number) => void;
  showOnly?: 'available' | 'sold' | 'all';
  interactive?: boolean;
}

export function TicketGrid({ 
  selectedNumbers, 
  onNumberToggle, 
  showOnly = 'all',
  interactive = true 
}: TicketGridProps) {
  const { config, soldNumbers } = useRaffleStore();
  const digitCount = String(config.endNumber).length;

  const allNumbers = Array.from(
    { length: config.endNumber - config.startNumber + 1 }, 
    (_, i) => config.startNumber + i
  );
  
  const filteredNumbers = allNumbers.filter(num => {
    if (showOnly === 'available') return !soldNumbers.includes(num);
    if (showOnly === 'sold') return soldNumbers.includes(num);
    return true;
  });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Números</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted" />
            <span className="text-muted-foreground">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-muted-foreground">Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/20" />
            <span className="text-muted-foreground">Vendido</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {filteredNumbers.map((num) => {
          const isSold = soldNumbers.includes(num);
          const isSelected = selectedNumbers.includes(num);
          
          return (
            <button
              key={num}
              disabled={isSold || !interactive}
              onClick={() => onNumberToggle?.(num)}
              className={cn(
                "ticket-number",
                isSold && "ticket-number-sold",
                isSelected && !isSold && "ticket-number-selected",
                !isSold && !isSelected && "ticket-number-available"
              )}
            >
              {num.toString().padStart(digitCount, '0')}
            </button>
          );
        })}
      </div>
      
      {filteredNumbers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay números {showOnly === 'sold' ? 'vendidos' : 'disponibles'}
        </div>
      )}
    </div>
  );
}
