import moment from 'moment';

/**
 * Calculates the Total Number of Infusions (TNI) based on start/end dates or duration.
 * @param startDate - Start date in DD/MM/YYYY format
 * @param endDate - End date in DD/MM/YYYY format
 * @param durationDays - Treatment duration in days as string
 * @param frequencyPerDay - Frequency per day as string
 * @returns An object containing the calculated TNI and the treatment duration in days.
 */
export const calculateTni = (
  startDate: string,
  endDate: string,
  durationDays: string,
  frequencyPerDay: string,
) => {
  const freq = Number(frequencyPerDay) || 0;
  let days = 0;

  if (startDate && endDate) {
    const start = moment(startDate, 'DD/MM/YYYY', true);
    const end = moment(endDate, 'DD/MM/YYYY', true);
    if (start.isValid() && end.isValid()) {
      const diff = end.diff(start, 'days');
      if (diff >= 0) {
        days = diff + 1; // inclusive
      }
    }
  }

  if (!days) {
    const n = Number(durationDays);
    if (!isNaN(n) && n > 0) days = n;
  }

  let finalDurationDays = durationDays;
  if (startDate && endDate) {
    const start = moment(startDate, 'DD/MM/YYYY', true);
    const end = moment(endDate, 'DD/MM/YYYY', true);
    if (start.isValid() && end.isValid()) {
      const diff = end.diff(start, 'days');
      if (diff >= 0) {
        finalDurationDays = String(diff + 1);
      }
    }
  }

  let tniCalc = '';
  if (days > 0) {
    tniCalc = String(freq > 0 ? days * freq : 0);
  }

  return {
    tni: tniCalc,
    treatmentDurationDays: finalDurationDays,
  };
};
