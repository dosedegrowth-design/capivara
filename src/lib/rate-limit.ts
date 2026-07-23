/**
 * Rate limit sliding window em memoria.
 *
 * Uso: rate limit por api_key (60 req/min default).
 *
 * Limitacoes:
 *  - Por instancia (Vercel serverless: cada funcao tem cache proprio).
 *    Pra rate limit global preciso: Upstash Redis, Cloudflare, ou pg-based.
 *  - Reinicia em cold start.
 *
 * Ainda assim, e melhor que SELECT count exact no banco:
 *  - Sem I/O de DB por request
 *  - Nao conta requests que retornaram 401/402 antes desta camada
 *  - Backpressure imediato
 */

interface Window {
  /** Timestamps (ms) das requisicoes na janela atual. */
  timestamps: number[];
  /** Ultima limpeza (evita GC excessivo). */
  lastCleanup: number;
}

// LRU rudimentar: cap 10k chaves. Se exceder, drop entradas mais antigas.
const MAX_KEYS = 10_000;
const cache = new Map<string, Window>();

function pruneCache() {
  if (cache.size <= MAX_KEYS) return;
  // Drop 10% das entradas mais antigas (por lastCleanup)
  const entries = [...cache.entries()];
  entries.sort((a, b) => a[1].lastCleanup - b[1].lastCleanup);
  const toDrop = Math.floor(MAX_KEYS * 0.1);
  for (let i = 0; i < toDrop && i < entries.length; i++) {
    cache.delete(entries[i][0]);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Consome 1 request de `key` no rate limit de `limit`/min.
 * Retorna se permitido + metadados pra header X-RateLimit-*.
 */
export function checkRateLimit(key: string, limit: number, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  let w = cache.get(key);
  if (!w) {
    w = { timestamps: [], lastCleanup: now };
    cache.set(key, w);
    pruneCache();
  }

  // Remove timestamps fora da janela
  if (w.timestamps.length > 0 && w.timestamps[0] < cutoff) {
    w.timestamps = w.timestamps.filter((t) => t >= cutoff);
  }

  w.lastCleanup = now;

  const current = w.timestamps.length;
  if (current >= limit) {
    // Nao adiciona timestamp (bloqueado). Reset = primeira timestamp + windowMs
    const oldest = w.timestamps[0] ?? now;
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetInSeconds,
    };
  }

  w.timestamps.push(now);
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - current - 1),
    resetInSeconds: Math.ceil(windowMs / 1000),
  };
}
