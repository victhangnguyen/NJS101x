import { convertDateVNtoUS } from './convertDate';
const toDateArray = (dates: string, multidateSeparator: string = ',') => {
  const dateArray = dates.split(multidateSeparator).map((date) => new Date(convertDateVNtoUS(date)));
  return dateArray;
};

export default toDateArray;
