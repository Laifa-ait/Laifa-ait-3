import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import orderQueryRouter from '../domains/order/controllers/OrderQueryController';

let mockOrderData: Record<string, unknown> | null = null;
let currentCallerUid: string | null = 'buyer_123';
let currentCallerRole: string = 'buyer';
let currentCallerStatus: string = 'active';

const mockDoc = vi.fn().mockImplementation((_docId: string) => ({
  get: vi.fn().mockImplementation(async () => ({
    exists: Boolean(mockOrderData),
    id: _docId,
    data: () => mockOrderData,
  })),
}));

const mockCollection = vi.fn().mockReturnValue({
  doc: mockDoc,
  where: vi.fn().mockReturnValue({
    orderBy: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({ docs: [] }),
      }),
    }),
  }),
});

vi.mock('../config/firebase-admin', () => ({
  db: {
    collection: (name: string) => mockCollection(name),
  },
  admin: {
    firestore: {
      FieldPath: {
        documentId: () => '__name__',
      },
    },
  },
}));

vi.mock('../middlewares/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../middlewares/auth')>();
  return {
    ...actual,
    authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!currentCallerUid) {
        return res.status(401).json({ error: 'Authentification requise. Jeton manquant.' });
      }
      req.user = {
        uid: currentCallerUid,
        email: `${currentCallerUid}@example.com`,
        role: currentCallerRole,
        status: currentCallerStatus,
        adminValidated: currentCallerRole === 'admin' || currentCallerRole === 'superadmin',
      };
      next();
    },
  };
});

describe('OLMART — Order Query Controller Access Control & BOLA Protection', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(orderQueryRouter);

    currentCallerUid = 'buyer_123';
    currentCallerRole = 'buyer';
    currentCallerStatus = 'active';
    mockOrderData = {
      userId: 'buyer_123',
      sellerId: 'seller_456',
      sellerIds: ['seller_456', 'seller_789'],
      total: 5500,
      status: 'pending',
    };
  });

  it('1. Rejects unauthenticated caller with 401', async () => {
    currentCallerUid = null;
    const res = await request(app).get('/orders/ORD-001');
    expect(res.status).toBe(401);
  });

  it('2. Rejects unauthorized buyer/caller with 403 (BOLA Guard)', async () => {
    currentCallerUid = 'unauthorized_stranger_999';
    const res = await request(app).get('/orders/ORD-001');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Access denied');
  });

  it('3. Allows legitimate buyer matching userId with 200', async () => {
    currentCallerUid = 'buyer_123';
    const res = await request(app).get('/orders/ORD-001');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('ORD-001');
    expect(res.body.userId).toBe('buyer_123');
  });

  it('4. Allows legitimate buyer matching buyerId with 200', async () => {
    mockOrderData = {
      buyerId: 'buyer_alternate_id',
      sellerId: 'seller_456',
      total: 2000,
    };
    currentCallerUid = 'buyer_alternate_id';
    const res = await request(app).get('/orders/ORD-001');
    expect(res.status).toBe(200);
    expect(res.body.buyerId).toBe('buyer_alternate_id');
  });

  it('5. Allows primary seller matching sellerId with 200', async () => {
    currentCallerUid = 'seller_456';
    currentCallerRole = 'seller';
    const res = await request(app).get('/orders/ORD-001');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(5500);
  });

  it('6. Allows co-seller in multi-vendor order matching sellerIds array with 200', async () => {
    currentCallerUid = 'seller_789';
    currentCallerRole = 'seller';
    const res = await request(app).get('/orders/ORD-001');
    expect(res.status).toBe(200);
  });

  it('7. Allows authorized admin with 200', async () => {
    currentCallerUid = 'admin_super_user';
    currentCallerRole = 'admin';
    const res = await request(app).get('/orders/ORD-001');
    expect(res.status).toBe(200);
  });

  it('8. Allows authorized superadmin with 200', async () => {
    currentCallerUid = 'superadmin_user';
    currentCallerRole = 'superadmin';
    const res = await request(app).get('/orders/ORD-001');
    expect(res.status).toBe(200);
  });

  it('9. Rejects suspended administrator with 403', async () => {
    currentCallerUid = 'suspended_admin';
    currentCallerRole = 'admin';
    currentCallerStatus = 'suspended';
    const res = await request(app).get('/orders/ORD-001');
    expect(res.status).toBe(403);
  });

  it('10. Returns 404 if order does not exist', async () => {
    mockOrderData = null;
    const res = await request(app).get('/orders/NONEXISTENT');
    expect(res.status).toBe(404);
  });
});
