export interface RaffleConfig {
  id: string;
  title: string;
  description: string;
  prize: string;
  prizeImage: string;
  bannerImage: string;
  drawDate: string;
  startNumber: number;
  endNumber: number;
  priceOne: number;
  priceTwo: number;
  priceThree: number;
  currency: string;
  isActive: boolean;
  specifications: string[];
}

export interface TicketPurchase {
  id: string;
  raffleId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  ticketNumbers: number[];
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  paymentStatus: 'pending' | 'verified' | 'cancelled';
  paymentMethod: string;
}

export interface PricingTier {
  quantity: number;
  price: number;
  label: string;
  savings?: string;
}
