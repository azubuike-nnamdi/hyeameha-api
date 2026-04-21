/** User fields exposed outside the service layer (no password or token hashes). */
export type UserPublic = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
