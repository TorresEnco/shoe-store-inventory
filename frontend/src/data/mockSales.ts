import type { SaleRecord } from '../types/sale';

const pad = (value: number) => String(value).padStart(2, '0');
const today = new Date();
const TODAY = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

export const MOCK_SALES: SaleRecord[] = [
  {
    id: 'V-104',
    time: '10:24',
    date: TODAY,
    cashierName: 'Carlos Torres',
    customerName: 'Público General',
    itemsSummary: '2x Zapatilla Urbana Cuero (T.38), 2x Botín Cuero Genuino (T.40)',
    total: 650,
    paymentType: 'CASH',
    status: 'COMPLETED',
    shoesToReturn: [
      { shoeId: 2, size: 38, quantity: 2 },
      { shoeId: 3, size: 40, quantity: 2 },
    ],
  },
  {
    id: 'V-103',
    time: '09:40',
    date: TODAY,
    cashierName: 'María López',
    customerName: 'Rosa Quispe',
    itemsSummary: '2x Zapatilla Urbana Cuero (T.40), 3x Zapato Formal Derby (T.40)',
    total: 770,
    paymentType: 'YAPE_PLIN',
    status: 'COMPLETED',
    shoesToReturn: [
      { shoeId: 2, size: 40, quantity: 2 },
      { shoeId: 4, size: 40, quantity: 3 },
    ],
  },
  {
    id: 'V-102',
    time: '09:10',
    date: TODAY,
    cashierName: 'María López',
    customerName: 'Público General',
    itemsSummary: '2x Mocasín Artesanal (T.39)',
    total: 240,
    paymentType: 'CASH',
    status: 'CANCELLED',
    shoesToReturn: [{ shoeId: 1, size: 39, quantity: 2 }],
  },
];
