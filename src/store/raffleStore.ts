import { create } from 'zustand';
import { RaffleConfig, TicketPurchase } from '@/types/raffle';
import { supabase } from '@/integrations/supabase/client';

interface RaffleState {
  config: RaffleConfig;
  purchases: TicketPurchase[];
  soldNumbers: number[];
  isLoading: boolean;
  configId: string | null;
  setConfig: (config: Partial<RaffleConfig>) => void;
  loadConfig: () => Promise<void>;
  saveConfig: () => Promise<boolean>;
  loadPurchases: () => Promise<void>;
  loadSoldNumbers: () => Promise<void>;
  addPurchase: (purchase: TicketPurchase) => void;
  updatePurchaseStatus: (id: string, status: TicketPurchase['paymentStatus']) => Promise<void>;
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
  startNumber: 1000,
  endNumber: 9999,
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
  ],
  paymentMethods: []
};

export const useRaffleStore = create<RaffleState>((set, get) => ({
  config: defaultConfig,
  purchases: [],
  soldNumbers: [],
  isLoading: false,
  configId: null,
  
  setConfig: (newConfig) => set((state) => ({
    config: { ...state.config, ...newConfig }
  })),
  
  loadConfig: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('raffle_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading config:', error);
        return;
      }

      if (data) {
        set({
          configId: data.id,
          config: {
            id: data.id,
            title: data.title,
            description: data.description || '',
            prize: data.prize,
            prizeImage: data.prize_image || '',
            bannerImage: data.banner_image || '',
            drawDate: data.draw_date || '',
            startNumber: data.start_number,
            endNumber: data.end_number,
            priceOne: Number(data.price_one),
            priceTwo: Number(data.price_two),
            priceThree: Number(data.price_three),
            currency: data.currency,
            isActive: data.is_active,
            specifications: data.specifications || [],
            paymentMethods: (data as any).payment_methods || []
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveConfig: async () => {
    const { config, configId } = get();
    
    try {
      const updateData = {
        title: config.title,
        description: config.description,
        prize: config.prize,
        prize_image: config.prizeImage,
        banner_image: config.bannerImage,
        draw_date: config.drawDate || null,
        start_number: config.startNumber,
        end_number: config.endNumber,
        price_one: config.priceOne,
        price_two: config.priceTwo,
        price_three: config.priceThree,
        currency: config.currency,
        is_active: config.isActive,
        specifications: config.specifications,
        payment_methods: JSON.parse(JSON.stringify(config.paymentMethods))
      };

      if (configId) {
        const { error } = await supabase
          .from('raffle_config')
          .update(updateData)
          .eq('id', configId);

        if (error) {
          console.error('Error saving config:', error);
          return false;
        }
      } else {
        const { data, error } = await supabase
          .from('raffle_config')
          .insert(updateData)
          .select()
          .single();

        if (error) {
          console.error('Error creating config:', error);
          return false;
        }

        set({ configId: data.id });
      }

      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  },

  loadSoldNumbers: async () => {
    try {
      const { data, error } = await supabase.rpc('get_sold_numbers');
      if (error) {
        console.error('Error loading sold numbers:', error);
        return;
      }
      set({ soldNumbers: (data as number[]) || [] });
    } catch (error) {
      console.error('Error:', error);
    }
  },

  loadPurchases: async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading purchases:', error);
        return;
      }

      if (data) {
        const purchases: TicketPurchase[] = data.map(p => ({
          id: p.id,
          raffleId: p.raffle_id || '',
          buyerName: p.buyer_name,
          buyerEmail: p.buyer_email,
          buyerPhone: p.buyer_phone,
          ticketNumbers: p.ticket_numbers,
          quantity: p.quantity,
          totalPrice: Number(p.total_price),
          purchaseDate: p.created_at,
          paymentStatus: p.payment_status as 'pending' | 'verified' | 'cancelled',
          paymentMethod: p.payment_method || 'pending',
          paymentImageUrl: p.payment_image_url || undefined
        }));

        // Solo contar como vendidos los números de compras NO canceladas
        const soldNumbers = data
          .filter(p => p.payment_status !== 'cancelled')
          .flatMap(p => p.ticket_numbers);

        set({ purchases, soldNumbers });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },
  
  addPurchase: (purchase) => set((state) => ({
    purchases: [...state.purchases, purchase],
    soldNumbers: [...state.soldNumbers, ...purchase.ticketNumbers]
  })),
  
  updatePurchaseStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('ticket_purchases')
        .update({ payment_status: status })
        .eq('id', id);

      if (error) {
        console.error('Error updating purchase status:', error);
        return;
      }

      // Actualizar estado local y recalcular soldNumbers
      set((state) => {
        const updatedPurchases = state.purchases.map(p => 
          p.id === id ? { ...p, paymentStatus: status } : p
        );
        
        // Recalcular números vendidos excluyendo cancelados
        const soldNumbers = updatedPurchases
          .filter(p => p.paymentStatus !== 'cancelled')
          .flatMap(p => p.ticketNumbers);

        return { purchases: updatedPurchases, soldNumbers };
      });
    } catch (error) {
      console.error('Error:', error);
    }
  },
  
  getAvailableNumbers: () => {
    const { config, soldNumbers } = get();
    const allNumbers = Array.from(
      { length: config.endNumber - config.startNumber + 1 }, 
      (_, i) => config.startNumber + i
    );
    return allNumbers.filter(n => !soldNumbers.includes(n));
  },
  
  generateRandomNumbers: (quantity) => {
    const available = get().getAvailableNumbers();
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, quantity);
  }
}));
