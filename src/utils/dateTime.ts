export const formatDate = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
};

export const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
