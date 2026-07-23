/**
 * Guard contra SSRF em URLs de webhook.
 *
 * Bloqueia:
 *  - Protocolos != https (dev pode permitir http://localhost por env)
 *  - Hostnames locais: localhost, *.local, *.internal, hostnames sem TLD
 *  - IPv4 em ranges privadas/loopback/link-local (RFC1918, 127/8, 169.254/16, ...)
 *  - IPv6 loopback (::1), link-local (fe80::/10), unique local (fc00::/7)
 *
 * NAO faz resolucao DNS (custa RTT + racy). Recomenda-se combinar com WAF
 * ou proxy egress que bloqueia CIDRs privados no nivel de rede.
 */

const IPV4_PRIVATE_CIDRS: Array<[number, number]> = [
  // [start, end] em u32
  [0x7F000000, 0x7FFFFFFF],   // 127.0.0.0/8
  [0x0A000000, 0x0AFFFFFF],   // 10.0.0.0/8
  [0xAC100000, 0xAC1FFFFF],   // 172.16.0.0/12
  [0xC0A80000, 0xC0A8FFFF],   // 192.168.0.0/16
  [0xA9FE0000, 0xA9FEFFFF],   // 169.254.0.0/16 (link-local, cloud metadata)
  [0x64400000, 0x647FFFFF],   // 100.64.0.0/10 (CGNAT)
  [0x00000000, 0x00FFFFFF],   // 0.0.0.0/8
  [0xE0000000, 0xEFFFFFFF],   // multicast 224/4
  [0xF0000000, 0xFFFFFFFF],   // reserved 240/4 (inc. broadcast)
];

function ipv4ToU32(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const oct = Number(p);
    if (!Number.isInteger(oct) || oct < 0 || oct > 255) return null;
    n = (n * 256) + oct;
  }
  return n >>> 0;
}

function isIpv4Private(ip: string): boolean {
  const u32 = ipv4ToU32(ip);
  if (u32 == null) return false;
  return IPV4_PRIVATE_CIDRS.some(([lo, hi]) => u32 >= lo && u32 <= hi);
}

function isIpv6BlockedHostname(host: string): boolean {
  // Remove brackets se URL passou "[::1]"
  const h = host.replace(/^\[/, "").replace(/\]$/, "").toLowerCase();
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fe80:")) return true; // link-local
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique local fc00::/7
  return false;
}

function isBlockedHostname(host: string): boolean {
  const h = host.toLowerCase();
  if (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h.endsWith(".lan") ||
    h.endsWith(".home") ||
    !h.includes(".")
  ) {
    return true;
  }
  // Cloud metadata IPs (nomes reservados)
  if (h === "metadata.google.internal") return true;
  if (h === "instance-data") return true;
  return false;
}

export interface WebhookUrlValidationResult {
  ok: boolean;
  error?: "invalid_url" | "protocol_not_https" | "private_ip" | "blocked_hostname" | "unsupported";
  hint?: string;
}

/**
 * Valida URL de webhook contra SSRF.
 * Em prod exige https. Em dev, permite http://localhost:port pra testes locais.
 */
export function validateWebhookUrl(rawUrl: string): WebhookUrlValidationResult {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return { ok: false, error: "invalid_url" };
  }

  // Protocolo: apenas https em prod. http permitido so em NODE_ENV=development
  // pra webhooks locais (tunnels, ngrok — que expoem https). Bloqueia file:,
  // gopher:, ftp:, javascript:, data:, etc.
  const allowedProtocols = new Set(["https:"]);
  if (process.env.NODE_ENV === "development") {
    allowedProtocols.add("http:");
  }
  if (!allowedProtocols.has(u.protocol)) {
    return { ok: false, error: "protocol_not_https", hint: "URL deve começar com https://" };
  }

  const host = u.hostname;

  // IPv4 literal
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    if (isIpv4Private(host)) {
      return { ok: false, error: "private_ip", hint: "IP privado/loopback/link-local nao permitido" };
    }
    // IP publico OK
    return { ok: true };
  }

  // IPv6 literal (com brackets)
  if (host.startsWith("[") && host.endsWith("]")) {
    if (isIpv6BlockedHostname(host)) {
      return { ok: false, error: "private_ip", hint: "IPv6 privado/loopback nao permitido" };
    }
    return { ok: true };
  }

  // Hostname textual
  if (isBlockedHostname(host)) {
    return { ok: false, error: "blocked_hostname", hint: "Hostname interno/reservado nao permitido" };
  }

  return { ok: true };
}
