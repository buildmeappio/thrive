export const WEEKDAYS = [
  { value: 0, label: "Monday", short: "Mon" },
  { value: 1, label: "Tuesday", short: "Tue" },
  { value: 2, label: "Wednesday", short: "Wed" },
  { value: 3, label: "Thursday", short: "Thu" },
  { value: 4, label: "Friday", short: "Fri" },
  { value: 5, label: "Saturday", short: "Sat" },
  { value: 6, label: "Sunday", short: "Sun" },
];

export const getWeekdayLabel = (weekday: number): string => {
  return WEEKDAYS.find(w => w.value === weekday)?.label ?? "Unknown";
};

export const getWeekdayShort = (weekday: number): string => {
  return WEEKDAYS.find(w => w.value === weekday)?.short ?? "N/A";
};

