
import { format, isSameDay } from "date-fns";

export const formatDate = (date: Date, formatString: string = "PPP") => {
  return format(date, formatString);
};

export const isSameDateUtil = (date1: Date, date2: Date) => {
  return isSameDay(date1, date2);
};

export const getCurrentDate = () => new Date();
