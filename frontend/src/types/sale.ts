export interface SaleRecord {
  id: string;
  time: string;
  date: string;
  cashierName: string;
  customerName: string;
  itemsSummary: string;
  total: number;
  paymentType: 'CASH' | 'YAPE_PLIN';
  status: 'COMPLETED' | 'CANCELLED';
  shoesToReturn: { shoeId: number; size: number; quantity: number }[];
}
