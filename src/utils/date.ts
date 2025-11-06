export const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

// Format taxonomy names: finance_or_billing → Finance or Billing, organization-manager → Organization Manager
export const formatTaxonomyName = (name: string): string => {
  if (!name) return name;
  
  // Replace underscores and hyphens with spaces
  const withSpaces = name.replace(/[_-]/g, ' ');
  
  // Words that should remain lowercase in title case
  const lowercaseWords = ['or', 'and', 'of', 'the', 'in', 'on', 'at', 'to', 'for', 'a', 'an'];
  
  // Split into words and capitalize appropriately
  const words = withSpaces.split(' ');
  const formatted = words.map((word, index) => {
    // Always capitalize the first word
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    // Keep connecting words lowercase
    if (lowercaseWords.includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    
    // Capitalize other words
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  return formatted.join(' ');
};
