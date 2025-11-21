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
// Preserves hyphens in numeric ranges: 2-3 Years → 2-3 Years (not 2 3 Years)
export const formatTaxonomyName = (name: string): string => {
  if (!name) return name;
  
  // Pattern to match numeric ranges (digits-hyphen-digits)
  const numericRangePattern = /(\d+)-(\d+)/g;
  
  // Find all numeric ranges and their positions
  const ranges: Array<{ start: number; end: number; value: string }> = [];
  let match;
  const nameCopy = name;
  
  // Reset regex lastIndex to ensure we find all matches
  numericRangePattern.lastIndex = 0;
  while ((match = numericRangePattern.exec(nameCopy)) !== null) {
    ranges.push({
      start: match.index,
      end: match.index + match[0].length,
      value: match[0],
    });
  }
  
  // If no numeric ranges found, use the original formatting logic
  if (ranges.length === 0) {
    // Replace underscores and hyphens with spaces
    const withSpaces = name.replace(/[_-]/g, ' ');
    
    // Words that should remain lowercase in title case
    const lowercaseWords = ['or', 'and', 'of', 'the', 'in', 'on', 'at', 'to', 'for', 'a', 'an'];
    
    // Split into words and capitalize appropriately
    const words = withSpaces.split(/\s+/).filter(word => word.length > 0);
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
  }
  
  // Process the string while preserving numeric ranges
  let result = '';
  let lastIndex = 0;
  
  ranges.forEach((range) => {
    // Add formatted text before this range
    if (range.start > lastIndex) {
      const textBefore = name.substring(lastIndex, range.start);
      // Replace underscores and hyphens (but not in numeric ranges) with spaces
      const withSpaces = textBefore.replace(/[_-]/g, ' ');
      const lowercaseWords = ['or', 'and', 'of', 'the', 'in', 'on', 'at', 'to', 'for', 'a', 'an'];
      const words = withSpaces.split(/\s+/).filter(word => word.length > 0);
      if (words.length > 0) {
        const formatted = words.map((word, index) => {
          const isFirstWord = result === '' && index === 0;
          if (isFirstWord || index === 0) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }
          if (lowercaseWords.includes(word.toLowerCase())) {
            return word.toLowerCase();
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
        result += formatted.join(' ');
        // Add a space before the range if there's text before it
        if (result.length > 0 && !result.endsWith(' ')) {
          result += ' ';
        }
      }
    }
    
    // Add the numeric range as-is (preserve the hyphen)
    result += range.value;
    lastIndex = range.end;
    
    // Check if there's a space after the range in the original string
    // and add it to maintain spacing
    if (lastIndex < name.length && name[lastIndex] === ' ') {
      result += ' ';
      lastIndex++; // Skip the space we just added
    }
  });
  
  // Add formatted text after the last range
  if (lastIndex < name.length) {
    const textAfter = name.substring(lastIndex);
    const withSpaces = textAfter.replace(/[_-]/g, ' ');
    const lowercaseWords = ['or', 'and', 'of', 'the', 'in', 'on', 'at', 'to', 'for', 'a', 'an'];
    const words = withSpaces.split(/\s+/).filter(word => word.length > 0);
    if (words.length > 0) {
      // Ensure there's a space between the range and the following text
      if (result.length > 0 && !result.endsWith(' ')) {
        result += ' ';
      }
      const formatted = words.map((word) => {
        if (lowercaseWords.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
      result += formatted.join(' ');
    }
  }
  
  return result.trim();
};

// Convert minutes since midnight to time format (HH:MM AM/PM)
// Example: 480 -> "8:00 AM", 900 -> "3:00 PM", 1439 -> "11:59 PM"
export const minutesToTime = (minutes: number): string => {
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0 || minutes >= 1440) {
    return String(minutes);
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12; // 0 or 12 should display as 12
  
  // Format with leading zeros for minutes
  const formattedMinutes = mins.toString().padStart(2, '0');
  
  return `${hour12}:${formattedMinutes} ${period}`;
};
