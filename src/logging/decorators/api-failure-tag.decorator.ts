import { SetMetadata, type CustomDecorator } from '@nestjs/common';

export const API_FAILURE_TAG_KEY = 'api_failure_tag';

/** Tag stored on failed API responses in `api_failure_logs` (e.g. `login`, `register`, `events`). */
export function ApiFailureTag(tag: string): CustomDecorator<string> {
  return SetMetadata(API_FAILURE_TAG_KEY, tag);
}
