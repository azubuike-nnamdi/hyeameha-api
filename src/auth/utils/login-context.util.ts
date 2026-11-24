import type { Request } from 'express';

export type LoginContext = {
  ipAddress: string;
  userAgent: string | null;
  /** Human-readable line for emails (IP + user agent). */
  locationSummary: string;
};

/**
 * Uses `req.ip`, which Express derives from X-Forwarded-For only up to the configured
 * `trust proxy` hop count; raw forwarding headers are client-controlled and not trusted.
 */
export function getLoginContext(req: Request): LoginContext {
  const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown';

  const rawUserAgent = req.headers['user-agent'];
  const userAgent =
    typeof rawUserAgent === 'string' ? rawUserAgent.slice(0, 256) : null;

  const locationSummary = userAgent
    ? `IP address ${ipAddress} (${userAgent})`
    : `IP address ${ipAddress}`;

  return { ipAddress, userAgent, locationSummary };
}
