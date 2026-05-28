import type { Request } from 'express';

export type LoginContext = {
  ipAddress: string;
  userAgent: string | null;
  /** Human-readable line for emails (IP + optional forwarded hint). */
  locationSummary: string;
};

export function getLoginContext(req: Request): LoginContext {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedIp =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0]?.trim()
      : Array.isArray(forwarded)
        ? forwarded[0]?.split(',')[0]?.trim()
        : undefined;

  const ipAddress =
    forwardedIp ||
    (typeof req.headers['x-real-ip'] === 'string'
      ? req.headers['x-real-ip']
      : undefined) ||
    req.ip ||
    req.socket.remoteAddress ||
    'Unknown';

  const userAgent =
    typeof req.headers['user-agent'] === 'string'
      ? req.headers['user-agent']
      : null;

  const locationSummary = userAgent
    ? `IP address ${ipAddress} (${userAgent})`
    : `IP address ${ipAddress}`;

  return { ipAddress, userAgent, locationSummary };
}
