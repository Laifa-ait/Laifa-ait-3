interface TransactionMetric {
  name: string;
  durationMs: number;
  success: boolean;
  timestamp: string;
  requestId: string;
}

const MAX_RING_BUFFER_SIZE = 100;
const ringBuffer: TransactionMetric[] = [];
let activeBackgroundTasks = 0;

export function recordTransactionMetric(metric: TransactionMetric): void {
  if (ringBuffer.length >= MAX_RING_BUFFER_SIZE) {
    ringBuffer.shift(); // Evict oldest metric
  }
  ringBuffer.push(metric);
}

export function incrementActiveTasks(): void {
  activeBackgroundTasks++;
}

export function decrementActiveTasks(): void {
  activeBackgroundTasks = Math.max(0, activeBackgroundTasks - 1);
}

export function getTelemetryStats() {
  const count = ringBuffer.length;
  const now = Date.now();
  const TEN_MINUTES_MS = 10 * 60 * 1000;

  const last10MinMetrics = ringBuffer.filter(
    (m) => now - Date.parse(m.timestamp) <= TEN_MINUTES_MS
  );

  const window10mCount = last10MinMetrics.length;
  const window10mAvgDurationMs =
    window10mCount > 0
      ? Number((last10MinMetrics.reduce((acc, m) => acc + m.durationMs, 0) / window10mCount).toFixed(2))
      : 0;

  const highLatencyAlert = window10mAvgDurationMs > 800;

  if (count === 0) {
    return {
      totalTrackedTransactions: 0,
      totalRecorded: 0,
      activeBackgroundTasks,
      avgTransactionDurationMs: 0,
      avgDurationMs: 0,
      minDurationMs: 0,
      maxDurationMs: 0,
      p95DurationMs: 0,
      successRatePercent: 100,
      successRate: 100,
      window10mAvgDurationMs: 0,
      window10mCount: 0,
      highLatencyAlert: false,
      recentTransactions: [],
      recentMetrics: [],
    };
  }

  let totalMs = 0;
  let minMs = Number.MAX_VALUE;
  let maxMs = 0;
  let successCount = 0;
  const sortedDurations = ringBuffer.map((m) => m.durationMs).sort((a, b) => a - b);

  for (const m of ringBuffer) {
    totalMs += m.durationMs;
    if (m.durationMs < minMs) minMs = m.durationMs;
    if (m.durationMs > maxMs) maxMs = m.durationMs;
    if (m.success) successCount++;
  }

  const p95Idx = Math.min(Math.floor(count * 0.95), count - 1);
  const p95DurationMs = Number(sortedDurations[p95Idx].toFixed(2));
  const avgMs = Number((totalMs / count).toFixed(2));
  const succPercent = Number(((successCount / count) * 100).toFixed(1));
  const recent = ringBuffer.slice(-20).reverse(); // 20 most recent, newest first

  return {
    totalTrackedTransactions: count,
    totalRecorded: count,
    activeBackgroundTasks,
    avgTransactionDurationMs: avgMs,
    avgDurationMs: avgMs,
    minDurationMs: Number(minMs.toFixed(2)),
    maxDurationMs: Number(maxMs.toFixed(2)),
    p95DurationMs,
    successRatePercent: succPercent,
    successRate: succPercent,
    window10mAvgDurationMs,
    window10mCount,
    highLatencyAlert,
    recentTransactions: recent,
    recentMetrics: recent,
  };
}
