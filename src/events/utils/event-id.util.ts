const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isLocalEventId(id: string): boolean {
  return UUID_RE.test(id);
}

const PARTNER_ID_RE = /^\d{1,18}$/;

/** eGotickets ids are numeric. */
export function isPartnerEventId(id: string): boolean {
  return PARTNER_ID_RE.test(id);
}
