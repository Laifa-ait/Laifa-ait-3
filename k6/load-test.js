import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 run k6/load-test.js
export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Simulate ramp-up of traffic from 1 to 100 users over 30 seconds
    { duration: '1m', target: 100 }, // Stay at 100 users for 1 minute
    { duration: '30s', target: 500 }, // Ramp-up to 500 users
    { duration: '1m', target: 500 }, // Stay at 500 users
    { duration: '30s', target: 1000 }, // Ramp-up to 1000 users
    { duration: '1m', target: 1000 }, // Stay at 1000 users
    { duration: '30s', target: 0 }, // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 1. Load Homepage
  const resHome = http.get(`${BASE_URL}/`);
  check(resHome, {
    'homepage status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // 2. API v1 Liveness Probe
  const resHealth = http.get(`${BASE_URL}/api/v1/health/live`);
  check(resHealth, {
    'health/live status is 200': (r) => r.status === 200,
  });

  // 3. Search Products via API v1
  const resSearch = http.get(`${BASE_URL}/api/v1/products?limit=20`);
  check(resSearch, {
    'api/v1/products status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
