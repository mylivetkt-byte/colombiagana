export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'mobile_payment' | 'other';
  accountNumber?: string;
  accountHolder?: string;
  bankName?: string;
  instructions?: string;
  isActive: boolean;
}

export interface PricingPlan {
  id: string;
  quantity: number;
  price: number;
  label?: string;
  isPopular?: boolean;
}

export interface RaffleConfig {
  id: string;
  title: string;
  description: string;
  prize: string;
  prizeImage: string;
  bannerImage: string;
  drawDate: string;
  showDrawDate?: boolean;
  startNumber: number;
  endNumber: number;
  priceOne: number;
  priceTwo: number;
  priceThree: number;
  currency: string;
  isActive: boolean;
  specifications: string[];
  paymentMethods: PaymentMethod[];
  plans?: PricingPlan[];
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
  paymentImageUrl?: string;
  emailSentAt?: string;
  emailError?: string;
}

export interface PricingTier {
  quantity: number;
  price: number;
  label: string;
  savings?: string;
}

export interface SpecialPrize {
  id: string;
  raffleId?: string;
  ticketNumber: number | null;
  prizeType: 'article' | 'money';
  prizeDescription: string;
  prizeAmount?: number;
  isActive: boolean;
  createdAt?: string;
}
