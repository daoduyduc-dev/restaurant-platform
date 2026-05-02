import { API_ORIGIN } from './config';

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';

  if (/^(https?:|blob:|data:)/i.test(url)) {
    return url;
  }

  return new URL(url, API_ORIGIN).toString();
}
