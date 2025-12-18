/**
 * Date utility functions to handle timezone-safe date parsing
 * 
 * The key issue: When parsing date-only strings like "2025-12-29",
 * JavaScript interprets them as UTC midnight, which shifts to the
 * previous day in timezones west of UTC (like Pacific Time).
 * 
 * These utilities ensure dates are interpreted in local time.
 */

/**
 * Parse a date string safely in local timezone.
 * Handles both date-only ("2025-12-29") and datetime strings.
 * 
 * @param dateStr - Date string from the database
 * @returns Date object interpreted in local timezone
 */
export function parseLocalDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  
  // If it's a full ISO datetime with time info, parse normally
  // These typically come from timestamp fields and are already correct
  if (dateStr.includes('T') || dateStr.includes(' ') && dateStr.includes(':')) {
    return new Date(dateStr);
  }
  
  // For date-only strings (YYYY-MM-DD), append T00:00:00 to force local interpretation
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T00:00:00');
  }
  
  // Fallback to normal parsing
  return new Date(dateStr);
}

/**
 * Parse a datetime string and extract just the date portion in local timezone.
 * Useful when you have a full timestamp but only care about the date for comparison.
 * 
 * @param dateStr - Date or datetime string
 * @returns Date object at midnight local time
 */
export function parseLocalDateOnly(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  
  const parsed = parseLocalDate(dateStr);
  if (!parsed || isNaN(parsed.getTime())) return null;
  
  // Reset to midnight local time for date-only comparisons
  const localDate = new Date(parsed);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
}

/**
 * Get today's date at midnight local time for comparisons.
 */
export function getTodayLocal(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Check if a date string represents a date in the past.
 * Uses date-only comparison (ignores time).
 * 
 * @param dateStr - Date or datetime string
 * @returns true if the date is before today
 */
export function isPastDate(dateStr: string | null | undefined): boolean {
  const date = parseLocalDateOnly(dateStr);
  if (!date) return false;
  
  const today = getTodayLocal();
  return date < today;
}

/**
 * Check if a date string represents today or a future date.
 * Uses date-only comparison (ignores time).
 * 
 * @param dateStr - Date or datetime string
 * @returns true if the date is today or later
 */
export function isUpcomingDate(dateStr: string | null | undefined): boolean {
  const date = parseLocalDateOnly(dateStr);
  if (!date) return false;
  
  const today = getTodayLocal();
  return date >= today;
}

/**
 * Compare two dates for same-day check, handling timezone issues.
 * 
 * @param dateStr1 - First date string
 * @param dateStr2 - Second date string or Date object
 * @returns true if both represent the same calendar day in local timezone
 */
export function isSameDayLocal(
  dateStr1: string | Date | null | undefined,
  dateStr2: string | Date | null | undefined
): boolean {
  const d1 = typeof dateStr1 === 'string' ? parseLocalDate(dateStr1) : dateStr1;
  const d2 = typeof dateStr2 === 'string' ? parseLocalDate(dateStr2) : dateStr2;
  
  if (!d1 || !d2) return false;
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
