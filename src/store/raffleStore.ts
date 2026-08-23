import { create } from 'zustand';
import { RaffleConfig, TicketPurchase, SpecialPrize } from '@/types/raffle';
import { supabase } from '@/integrations/supabase/client';

interface RaffleState {
  config: RaffleConfig;
  purchases: TicketPurchase[];
  soldNumbers: number[];
  specialPrizes: SpecialPrize[];
  isLoading: boolean;
  configId: string | null;
  setConfig: (config: Partial<RaffleConfig>) => void;
  loadConfig: () => Promise<void>;
  saveConfig: () => Promise<boolean>;
  loadPurchases: () => Promise<void>;
  loadSoldNumbers: () => Promise<void>;
  addPurchase: (purchase: TicketPurchase) => void;
  updatePurchaseStatus: (id: string, status: TicketPurchase['paymentStatus']) => Promise<void>;
  resetRaffle: () => Promise<void>;
  getAvailableNumbers: () => number[];
  generateRandomNumbers: (quantity: number) => number[];
  loadSpecialPrizes: () => Promise<void>;
  addSpecialPrize: (prize: Omit<SpecialPrize, 'id' | 'createdAt'>) => Promise<boolean>;
  updateSpecialPrize: (id: string, changes: Partial<SpecialPrize>) => Promise<boolean>;
  deleteSpecialPrize: (id: string) => Promise<boolean>;
}

const defaultConfig: RaffleConfig = {
  id: '1',
  title: 'Gran Rifa del Año',
  description: 'Participa y gana increíbles premios',
  prize: 'iPhone 15 Pro Max + $1,000 USD',
  prizeImage: '',
  bannerImage: '',
  drawDate: '2024-12-31',
  showDrawDate: true,
  startNumber: 1000,
  endNumber: 9999,
  priceOne: 2000,
  priceTwo: 4000,
  priceThree: 8000,
  currency: 'COP',
  isActive: true,
  specifications: [
    'Sorteo en vivo por Facebook Live',
    'Se realizará con la Lotería Nacional',
    'El ganador será contactado por teléfono y correo',
    'Premio entregado en 24-48 horas'
  ],
  paymentMethods: [],
  plans: [
    { id: '1', quantity: 1, price: 2000, label: 'Una Boleta' },
    { id: '2', quantity: 2, price: 4000, label: 'Dos Boletas' },
    { id: '3', quantity: 3, price: 8000, label: 'Tres Boletas', isPopular: true },
    { id: '4', quantity: 4, price: 10000, label: 'Cuatro Boletas' },
  ]
};

export const useRaffleStore = create<RaffleState>((set, get) => ({
  config: defaultConfig,
  purchases: [],
  soldNumbers: [],
  specialPrizes: [],
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
        const loadedPlans = (data as any).pricing_plans;
        const plans = Array.isArray(loadedPlans) && loadedPlans.length > 0
          ? loadedPlans
          : [
              { id: '1', quantity: 1, price: Number(data.price_one) || 2000, label: 'Una Boleta' },
              { id: '2', quantity: 2, price: Number(data.price_two) || 4000, label: 'Dos Boletas' },
              { id: '3', quantity: 3, price: Number(data.price_three) || 8000, label: 'Tres Boletas', isPopular: true },
            ];

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
            showDrawDate: (data as any).show_draw_date ?? true,
            startNumber: data.start_number,
            endNumber: data.end_number,
            priceOne: Number(data.price_one),
            priceTwo: Number(data.price_two),
            priceThree: Number(data.price_three),
            currency: data.currency,
            isActive: data.is_active,
            specifications: data.specifications || [],
            paymentMethods: (data as any).payment_methods || [],
            plans: plans,
            brevoApiKey: data.brevo_api_key || undefined,
            brevoSenderEmail: data.brevo_sender_email || undefined,
            brevoSenderName: data.brevo_sender_name || undefined
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
    const plansToSave = config.plans && config.plans.length > 0 ? config.plans : defaultConfig.plans;
    
    try {
      const updateData: any = {
        title: config.title,
        description: config.description,
        prize: config.prize,
        prize_image: config.prizeImage,
        banner_image: config.bannerImage,
        draw_date: config.drawDate || null,
        show_draw_date: config.showDrawDate ?? true,
        start_number: config.startNumber,
        end_number: config.endNumber,
        price_one: plansToSave?.[0]?.price ?? config.priceOne,
        price_two: plansToSave?.[1]?.price ?? config.priceTwo,
        price_three: plansToSave?.[2]?.price ?? config.priceThree,
        currency: config.currency,
        is_active: config.isActive,
        specifications: config.specifications,
        payment_methods: JSON.parse(JSON.stringify(config.paymentMethods)),
        pricing_plans: JSON.parse(JSON.stringify(plansToSave)),
        brevo_api_key: config.brevoApiKey || null,
        brevo_sender_email: config.brevoSenderEmail || null,
        brevo_sender_name: config.brevoSenderName || null
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
          paymentImageUrl: p.payment_image_url || undefined,
          emailSentAt: p.email_sent_at || undefined,
          emailError: p.email_error || undefined
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

  resetRaffle: async () => {
    try {
      const { configId } = get();
      
      if (!configId) {
        return;
      }

      const { error } = await supabase
        .from('ticket_purchases')
        .delete()
        .eq('raffle_id', configId);

      if (error) {
        console.error('Error resetting raffle:', error);
        return;
      }

      set({ purchases: [], soldNumbers: [] });
    } catch (error) {
      console.error('Error:', error);
    }
  },
  
  getAvailableNumbers: () => {
    const { config, soldNumbers, specialPrizes } = get();
    const allNumbers = Array.from(
      { length: config.endNumber - config.startNumber + 1 }, 
      (_, i) => config.startNumber + i
    );
    const totalNumbers = config.endNumber - config.startNumber + 1;
    const soldPercentage = totalNumbers > 0 ? (soldNumbers.length / totalNumbers) * 100 : 0;
    
    let available = allNumbers.filter(n => !soldNumbers.includes(n));
    
    if (soldPercentage < 30) {
      const prizeNumbers = specialPrizes
        .map(p => p.ticketNumber)
        .filter((n): n is number => n !== null);
      available = available.filter(n => !prizeNumbers.includes(n));
    }
    
    return available;
  },
  
  generateRandomNumbers: (quantity) => {
    const available = get().getAvailableNumbers();
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, quantity);
  },

  loadSpecialPrizes: async () => {
    try {
      const { configId } = get();
      let query = supabase.from('special_prizes').select('*').order('created_at', { ascending: true });
      if (configId) query = query.eq('raffle_id', configId);
      const { data, error } = await query;
      if (error) { console.error('Error loading special prizes:', error); return; }
      const prizes: SpecialPrize[] = (data || []).map(p => ({
        id: p.id,
        raffleId: p.raffle_id || undefined,
        ticketNumber: p.ticket_number,
        prizeType: p.prize_type as 'article' | 'money',
        prizeDescription: p.prize_description,
        prizeAmount: p.prize_amount ? Number(p.prize_amount) : undefined,
        isActive: p.is_active,
        createdAt: p.created_at
      }));
      set({ specialPrizes: prizes });
    } catch (error) {
      console.error('Error:', error);
    }
  },

  addSpecialPrize: async (prize) => {
    try {
      const { configId } = get();
      const { data, error } = await supabase
        .from('special_prizes')
        .insert({
          raffle_id: configId,
          ticket_number: prize.ticketNumber,
          prize_type: prize.prizeType,
          prize_description: prize.prizeDescription,
          prize_amount: prize.prizeAmount ?? null,
          is_active: prize.isActive
        })
        .select()
        .single();
      if (error) { console.error('Error adding special prize:', error); return false; }
      const newPrize: SpecialPrize = {
        id: data.id,
        raffleId: data.raffle_id || undefined,
        ticketNumber: data.ticket_number,
        prizeType: data.prize_type as 'article' | 'money',
        prizeDescription: data.prize_description,
        prizeAmount: data.prize_amount ? Number(data.prize_amount) : undefined,
        isActive: data.is_active,
        createdAt: data.created_at
      };
      set(state => ({ specialPrizes: [...state.specialPrizes, newPrize] }));
      return true;
    } catch (error) {
      console.error('Error:', error); return false;
    }
  },

  updateSpecialPrize: async (id, changes) => {
    try {
      const updateData: any = {};
      if (changes.isActive !== undefined) updateData.is_active = changes.isActive;
      if (changes.prizeDescription !== undefined) updateData.prize_description = changes.prizeDescription;
      if (changes.prizeType !== undefined) updateData.prize_type = changes.prizeType;
      if (changes.prizeAmount !== undefined) updateData.prize_amount = changes.prizeAmount;
      if (changes.ticketNumber !== undefined) updateData.ticket_number = changes.ticketNumber;
      const { error } = await supabase.from('special_prizes').update(updateData).eq('id', id);
      if (error) { console.error('Error updating special prize:', error); return false; }
      set(state => ({
        specialPrizes: state.specialPrizes.map(p => p.id === id ? { ...p, ...changes } : p)
      }));
      return true;
    } catch (error) {
      console.error('Error:', error); return false;
    }
  },

  deleteSpecialPrize: async (id) => {
    try {
      const { error } = await supabase.from('special_prizes').delete().eq('id', id);
      if (error) { console.error('Error deleting special prize:', error); return false; }
      set(state => ({ specialPrizes: state.specialPrizes.filter(p => p.id !== id) }));
      return true;
    } catch (error) {
      console.error('Error:', error); return false;
    }
  }
}));
