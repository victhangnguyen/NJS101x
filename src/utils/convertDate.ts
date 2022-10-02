export const ddmmyyyyToMMDDYYYY = (date: string) => {
  const [day, month, year] = date.split('/');
  const newDate = [month, day, year].join('/');
  return newDate;
};