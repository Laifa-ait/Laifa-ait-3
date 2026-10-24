export interface OrderItem {
  sellerId: string;
  price: number;
  quantity: number;
}

export interface Order {
  total: number;
  subtotal?: number;
  sellerId?: string;
  sellerIds?: string[];
  items?: OrderItem[];
}

export function calculateOrderCommission(
  order: Order,
  _sellerRates: Record<string, number>,
  _globalRate: number
): { orderCommission: number; netPayout: number } {
  // Olmart's revenue comes from advertising. Product sales are not charged a platform commission.
  return { orderCommission: 0, netPayout: Math.max(0, Number(order.total) || 0) };
}
