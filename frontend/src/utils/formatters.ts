export const getCurrencyCodeForLanguage = (language: string) => (language === 'vi' ? 'VND' : 'USD');

export const VND_TO_USD_RATE = 26316;

export const convertVndToUsd = (value: number | undefined) => (value || 0) / VND_TO_USD_RATE;

export const formatCurrencyByLanguage = (value: number | undefined, language: string) =>
  new Intl.NumberFormat(language, {
    style: 'currency',
    currency: getCurrencyCodeForLanguage(language),
    maximumFractionDigits: language === 'vi' ? 0 : 2,
  }).format(value || 0);

export const formatVndCurrency = (value: number | undefined, language: string) =>
  language === 'vi'
    ? new Intl.NumberFormat(language, {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(value || 0)
    : new Intl.NumberFormat(language, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(convertVndToUsd(value));
