export type ApiDataResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export function apiResponse<T>(
  data: T,
  message: string,
  statusCode = 200,
): ApiDataResponse<T> {
  return { statusCode, message, data };
}
