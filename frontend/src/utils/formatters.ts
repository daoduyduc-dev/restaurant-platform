export const getCurrencyCodeForLanguage = (language: string) => (language === 'vi' ? 'VND' : 'USD');

export const formatCurrencyByLanguage = (value: number | undefined, language: string) => {
  const formatted = new Intl.NumberFormat(language, {
    maximumFractionDigits: 0,
  }).format(value || 0);
  return `${formatted} VNĐ`;
};

export const formatVndCurrency = (value: number | undefined, language: string) => {
  const formatted = new Intl.NumberFormat(language, {
    maximumFractionDigits: 0,
  }).format(value || 0);
  return `${formatted} VNĐ`;
};
