/** Attached to the request after JWT validation */
export type JwtPayloadUser = {
  sub: string;
  email: string;
};
