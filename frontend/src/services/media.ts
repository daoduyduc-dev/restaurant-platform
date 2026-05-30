import { API_ORIGIN } from './config';

const DEFAULT_FALLBACK_IMAGE_URL = '/food_placeholder.png';
const DEFAULT_AVATAR_IMAGE_URL = '/uploads/avatars/avatar.jpg';

export function resolveMediaUrl(url?: string | null, fallbackUrl = DEFAULT_FALLBACK_IMAGE_URL): string {
  if (!url) return fallbackUrl;

  // Keep backend-uploaded assets as relative paths so Vite dev proxy can forward /uploads/*
  // to the API server. This avoids resolving them to the frontend origin (e.g. :8081),
  // which would fail if the frontend dev server is not serving those files directly.
  if (url.startsWith('/uploads/')) {
    return url;
  }

  if (/^(https?:|blob:|data:)/i.test(url)) {
    return url;
  }

  try {
    return new URL(url, API_ORIGIN).toString();
  } catch {
    return fallbackUrl;
  }
}

export { DEFAULT_FALLBACK_IMAGE_URL, DEFAULT_AVATAR_IMAGE_URL };
