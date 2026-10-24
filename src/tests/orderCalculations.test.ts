import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateOrderCommission, Order } from '../utils/orderCalculations';
import { BusinessError, OrderStatusService } from '../domains/order/services/orderStatus.service';

const { mockCollection, mockRunTransaction, mockAdmin, mockDoc, mockGet } = vi.hoisted(() => {
  const mCollection = vi.fn();
  const mRunTransaction = vi.fn();
  const mDoc = vi.fn();
  const mGet = vi.fn();
  const mAdmin = {
    firestore: {
      FieldValue: {
        serverTimestamp: vi.fn(() => "mock-timestamp"),
        increment: vi.fn((val) => ({ val, type: "increment" })),
      },
    },
  };
  return {
    mockCollection: mCollection,
    mockRunTransaction: mRunTransaction,
    mockAdmin: mAdmin,
    mockDoc: mDoc,
    mockGet: mGet,
  };
});

vi.mock("../config/firebase-admin", () => {
  return {
    db: {
      collection: mockCollection,
      runTransaction: mockRunTransaction,
    },
    admin: mockAdmin,
  };
});

describe('Production Order Calculations & Transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCollection.mockImplementation(() => ({
      doc: mockDoc,
    }));
    mockDoc.mockImplementation(() => ({
      get: mockGet,
      collection: vi.fn(() => ({
        doc: vi.fn(() => "mock-doc"),
      })),
    }));
  });

  describe('Seller proceeds (utils/orderCalculations)', () => {
    it('does not charge a commission on multi-seller orders', () => {
      const mockOrder: Order = {
        total: 1000,
        items: [
          { sellerId: 'seller-a', price: 100, quantity: 2 },
          { sellerId: 'seller-b', price: 400, quantity: 2 }
        ]
      };
      const result = calculateOrderCommission(mockOrder, { 'seller-a': 10, 'seller-b': 15 }, 12);
      expect(result.orderCommission).toBe(0);
      expect(result.netPayout).toBe(1000);
    });

    it('returns the full order amount when items are missing', () => {
      const result = calculateOrderCommission({ total: 5000, subtotal: 5000, sellerId: 'seller-c' }, { 'seller-c': 8 }, 10);
      expect(result.orderCommission).toBe(0);
      expect(result.netPayout).toBe(5000);
    });
  });

  describe('Order Status Transitions (domains/order/services)', () => {
    const runTransition = async (currentStatus: string, status: string) => {
      mockRunTransaction.mockImplementationOnce(async (callback) => {
        const tx = {
          get: vi.fn(async () => ({
            exists: true,
            data: () => ({ status: currentStatus, sellerId: "seller-1", sellerIds: ["seller-1"] }),
          })),
          update: vi.fn(),
          set: vi.fn(),
        };
        return callback(tx);
      });
      return OrderStatusService.updateOrderStatus({
        orderIds: ["order-1"], status, sellerId: "seller-1", isUserAdmin: true, authUid: "admin-1",
      });
    };

    it('allows valid status transitions within the state machine', async () => {
      await expect(runTransition("new", "processing")).resolves.not.toThrow();
    });

    it('rejects invalid status transitions with BusinessError', async () => {
      await expect(runTransition("canceled", "processing")).rejects.toThrow(BusinessError);
    });
  });
});