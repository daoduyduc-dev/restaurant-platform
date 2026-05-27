import i18n from '../i18n';

export const translateStatus = (status: string): string => {
  const translated = i18n.t(`status.${status}`);
  return translated === `status.${status}` ? status : translated;
};
