import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveAuthentication, AuthenticatedRequest } from '../middlewares/auth';

let mockUserDocData: Record<string, unknown> | null = null;
let mockVerifyIdTokenRejectError: Error | null = null;
let mockVerifyIdTokenSuccessData: Record<string, unknown> | null = null;

vi.mock('../config/firebase-admin', () => ({
  admin: {
    auth: () => ({
      verifyIdToken: vi.fn().mockImplementation(async (_token: string, _checkRevoked: boolean) => {
        if (mockVerifyIdTokenRejectError) {
          throw mockVerifyIdTokenRejectError;
        }
        return mockVerifyIdTokenSuccessData || {
          uid: 'user_123',
          email: 'test@example.com',
          role: 'buyer',
          auth_time: Math.floor(Date.now() / 1000),
        };
      }),
      verifySessionCookie: vi.fn().mockImplementation(async (_token: string, _checkRevoked: boolean) => {
        if (mockVerifyIdTokenRejectError) {
          throw mockVerifyIdTokenRejectError;
        }
        return mockVerifyIdTokenSuccessData || {
          uid: 'user_123',
          email: 'test@example.com',
          role: 'admin',
          auth_time: Math.floor(Date.now() / 1000),
        };
      }),
    }),
    firestore: {
      FieldValue: {
        serverTimestamp: () => 'MOCK_TIMESTAMP',
        delete: () => 'MOCK_DELETE',
        increment: (n: number) => n,
      },
      Timestamp: {
        fromMillis: (ms: number) => ({ toMillis: () => ms }),
      },
    },
  },
  db: {
    collection: (_coll: string) => ({
      doc: (_id: string) => ({
        get: vi.fn().mockResolvedValue({
          exists: Boolean(mockUserDocData),
          data: () => mockUserDocData,
        }),
        set: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
      }),
    }),
  },
}));

describe('OLMART — Authentication & Identity Security Layer', () => {
  beforeEach(() => {
    mockUserDocData = null;
    mockVerifyIdTokenRejectError = null;
    mockVerifyIdTokenSuccessData = null;
  });

  it('1. Correctly rejects missing credentials as anonymous without error', async () => {
    const req = {
      headers: {},
      cookies: {},
    } as unknown as AuthenticatedRequest;

    const result = await resolveAuthentication(req);
    expect(result.status).toBe('anonymous');
    expect(req.user).toBeUndefined();
  });

  it('2. Detects and handles revoked token error explicitly', async () => {
    const revokedErr = new Error('Firebase ID token has been revoked');
    (revokedErr as unknown as { code: string }).code = 'auth/id-token-revoked';
    mockVerifyIdTokenRejectError = revokedErr;

    const req = {
      headers: { authorization: 'Bearer revoked_test_token' },
      cookies: {},
    } as unknown as AuthenticatedRequest;

    const result = await resolveAuthentication(req);
    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.statusCode).toBe(401);
      expect(result.error).toBe('Jeton révoqué. Veuillez vous reconnecter.');
    }
  });

  it('3. Detects and handles disabled user accounts with 401', async () => {
    const disabledErr = new Error('The user account has been disabled');
    (disabledErr as unknown as { code: string }).code = 'auth/user-disabled';
    mockVerifyIdTokenRejectError = disabledErr;

    const req = {
      headers: { authorization: 'Bearer disabled_user_token' },
      cookies: {},
    } as unknown as AuthenticatedRequest;

    const result = await resolveAuthentication(req);
    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.statusCode).toBe(401);
      expect(result.error).toBe("Compte utilisateur désactivé par l'administration.");
    }
  });

  it('4. In production mode, sanitizes generic token verification errors to prevent information leak', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const genericErr = new Error('Internal crypto verification failure at line 42 with key ID K-9928');
      mockVerifyIdTokenRejectError = genericErr;

      const req = {
        headers: { authorization: 'Bearer malformed_token' },
        cookies: {},
      } as unknown as AuthenticatedRequest;

      const result = await resolveAuthentication(req);
      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.statusCode).toBe(401);
        expect(result.error).toBe("Jeton d'authentification invalide ou expiré.");
        expect(result.error).not.toContain('crypto');
        expect(result.error).not.toContain('K-9928');
      }
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('5. Enforces fail-closed evaluation: if user has admin claim but DB role is buyer, demotes to buyer', async () => {
    mockVerifyIdTokenSuccessData = {
      uid: 'sneaky_user',
      role: 'admin',
    };
    mockUserDocData = {
      role: 'buyer',
      status: 'active',
    };

    const req = {
      headers: { authorization: 'Bearer token_with_stale_admin_claim' },
      cookies: {},
    } as unknown as AuthenticatedRequest;

    const result = await resolveAuthentication(req);
    expect(result.status).toBe('authenticated');
    if (result.status === 'authenticated') {
      expect(result.user.role).toBe('buyer');
      expect(result.user.adminValidated).toBe(false);
    }
  });

  it('6. Enforces fail-closed evaluation: if user status in DB is suspended, effective role becomes suspended', async () => {
    mockVerifyIdTokenSuccessData = {
      uid: 'bad_actor',
      role: 'seller',
    };
    mockUserDocData = {
      role: 'seller',
      status: 'suspended',
    };

    const req = {
      headers: { authorization: 'Bearer token_seller_suspended' },
      cookies: {},
    } as unknown as AuthenticatedRequest;

    const result = await resolveAuthentication(req);
    expect(result.status).toBe('authenticated');
    if (result.status === 'authenticated') {
      expect(result.user.role).toBe('suspended');
    }
  });
});
