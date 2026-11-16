export interface OrderSalesItem {
  id?: string;
  quantity?: number;
}

export interface ProductSalesUpdateTarget {
  salesCount?: number;
  [key: string]: unknown;
}

/**
 * Computes transactional `salesCount` updates on products when an order reaches
 * verified delivery (`delivered`) or reverses cleanly upon `returned`/`canceled`/`refunded`.
 */
export function applyOrderSalesCountDelta(params: {
  targetStatus: string;
  currentStatus: string;
  salesCountRecorded: boolean;
  items: OrderSalesItem[];
  productUpdates: Map<string, ProductSalesUpdateTarget>;
}): { nextSalesCountRecorded: boolean; changed: boolean } {
  const { targetStatus, currentStatus, salesCountRecorded, items, productUpdates } = params;
  const tStatus = targetStatus.toLowerCase();
  const cStatus = currentStatus.toLowerCase();

  let deltaDirection: 1 | -1 | 0 = 0;
  let nextRecorded = salesCountRecorded;

  if (tStatus === "delivered" && cStatus !== "delivered" && !salesCountRecorded) {
    deltaDirection = 1;
    nextRecorded = true;
  } else if (
    (tStatus === "returned" || tStatus === "canceled" || tStatus === "refunded") &&
    salesCountRecorded
  ) {
    deltaDirection = -1;
    nextRecorded = false;
  }

  if (deltaDirection === 0) {
    return { nextSalesCountRecorded: salesCountRecorded, changed: false };
  }

  let changed = false;
  for (const item of items) {
    if (!item.id) continue;
    const productState = productUpdates.get(item.id);
    if (!productState) continue;
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const currentSales = Math.max(0, Number(productState.salesCount) || 0);
    productState.salesCount = Math.max(0, currentSales + deltaDirection * qty);
    changed = true;
  }

  return { nextSalesCountRecorded: nextRecorded, changed };
}
