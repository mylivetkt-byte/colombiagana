import { create } from 'zustand';
import { RaffleConfig, TicketPurchase } from '@/types/raffle';

interface RaffleState {
  config: RaffleConfig;
  purchases: TicketPurchase[];
  soldNumbers: number[];
  setConfig: (config: Partial<RaffleConfig>) => void;
  addPurchase: (purchase: TicketPurchase) => void;
  updatePurchaseStatus: (id: string, status: TicketPurchase['paymentStatus']) => void;
  getAvailableNumbers: () => number[];
  generateRandomNumbers: (quantity: number) => number[];
}

const defaultConfig: RaffleConfig = {
  id: '1',
  title: 'Gran Rifa del Año',
  description: 'Participa y gana increíbles premios',
  prize: 'iPhone 15 Pro Max + $1,000 USD',
  prizeImage: '',
  bannerImage: '',
  drawDate: '2024-12-31',
  totalNumbers: 100,
  priceOne: 10,
  priceTwo: 18,
  priceThree: 25,
  currency: 'USD',
  isActive: true,
  specifications: [
    'Sorteo en vivo por Facebook Live',
    'Se realizará con la Lotería Nacional',
    'El ganador será contactado por teléfono y correo',
    'Premio entregado en 24-48 horas'
  ]
};

export const useRaffleStore = create<RaffleState>((set, get) => ({
  config: defaultConfig,
  purchases: [],
  soldNumbers: [],
  
  setConfig: (newConfig) => set((state) => ({
    config: { ...state.config, ...newConfig }
  })),
  
  addPurchase: (purchase) => set((state) => ({
    purchases: [...state.purchases, purchase],
    soldNumbers: [...state.soldNumbers, ...purchase.ticketNumbers]
  })),
  
  updatePurchaseStatus: (id, status) => set((state) => ({
    purchases: state.purchases.map(p => 
      p.id === id ? { ...p, paymentStatus: status } : p
    )
  })),
  
  getAvailableNumbers: () => {
    const { config, soldNumbers } = get();
    const allNumbers = Array.from({ length: config.totalNumbers }, (_, i) => i + 1);
    return allNumbers.filter(n => !soldNumbers.includes(n));
  },
  
  generateRandomNumbers: (quantity) => {
    const available = get().getAvailableNumbers();
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, quantity);
  }
}));
