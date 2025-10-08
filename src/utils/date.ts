export const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export const convertTo12HourFormat = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Format date as "Apr 18, 25" (short month, day, 2-digit year)
export const formatDateShort = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear().toString().slice(-2);
    return `${month} ${day}, ${year}`;
}

// src/utils/date.ts
export const formatDateLong = (d: string | number | Date) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(d));
