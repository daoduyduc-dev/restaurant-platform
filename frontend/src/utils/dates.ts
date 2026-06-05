export const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const combineLocalDateAndTime = (date: string, time: string) => `${date}T${time}:00`;

export const addDaysToLocalDateString = (date: string, days: number) => {
  const current = new Date(`${date}T00:00:00`);
  current.setDate(current.getDate() + days);
  return getLocalDateString(current);
};
