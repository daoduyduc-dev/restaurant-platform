export const getCurrencyCodeForLanguage = (language: string) => (language === 'vi' ? 'VND' : 'USD');

export const formatCurrencyByLanguage = (value: number | undefined, language: string) =>
  new Intl.NumberFormat(language, {
    style: 'currency',
    currency: getCurrencyCodeForLanguage(language),
    maximumFractionDigits: language === 'vi' ? 0 : 2,
  }).format(value || 0);

export const formatVndCurrency = (value: number | undefined, language: string) =>
  new Intl.NumberFormat(language, {
    style: 'currency',
    currency: getCurrencyCodeForLanguage(language),
    maximumFractionDigits: language === 'vi' ? 0 : 2,
  }).format(value || 0);
