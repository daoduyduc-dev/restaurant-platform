export const getCurrencyCodeForLanguage = (language: string) => (language === 'vi' ? 'VND' : 'USD');

export const formatCurrencyByLanguage = (value: number | undefined, language: string) => {
  const amount = (value || 0) * 1000;
  const formatted = new Intl.NumberFormat(language, {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} VNĐ`;
};

export const formatVndCurrency = (value: number | undefined, language: string) => {
  const amount = (value || 0) * 1000;
  const formatted = new Intl.NumberFormat(language, {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} VNĐ`;
};
