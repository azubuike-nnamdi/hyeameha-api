/** Typed JSON bodies for supertest responses (superagent types `body` as `any`). */

export type HealthResponseBody = {
  status: string;
  database: string;
};

export type AuthSuccessBody = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export type PublicUserBody = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};
