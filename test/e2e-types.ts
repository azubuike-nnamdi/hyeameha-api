/** Typed JSON bodies for supertest responses (superagent types `body` as `any`). */

export type HealthResponseBody = {
  status: string;
  database: string;
};

export type AuthSuccessBody = {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  };
};

export type PublicUserBody = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
};
