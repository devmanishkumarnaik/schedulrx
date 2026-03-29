import { format, addMinutes, startOfDay, endOfDay, parseISO, isAfter, isBefore } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * Generate available time slots for a given date based on availability settings
 * @param {Date} date - The date to generate slots for
 * @param {Object} dayAvailability - { start: "09:00", end: "17:00" }
 * @param {number} duration - Event duration in minutes
 * @param {Array} existingBookings - Array of { startTime, endTime } objects
 * @param {string} timezone - IANA timezone string
 * @returns {Array} Array of available time slot objects
 */
export function generateTimeSlots(date, dayAvailability, duration, existingBookings = [], timezone = 'UTC') {
  if (!dayAvailability || !dayAvailability.enabled) return [];

  const slots = [];
  const [startHour, startMin] = dayAvailability.start.split(':').map(Number);
  const [endHour, endMin] = dayAvailability.end.split(':').map(Number);

  // Build start and end in the host's timezone
  const dayStr = format(date, 'yyyy-MM-dd');
  const slotStart = fromZonedTime(`${dayStr}T${dayAvailability.start}:00`, timezone);
  const slotEnd   = fromZonedTime(`${dayStr}T${dayAvailability.end}:00`, timezone);

  let current = slotStart;
  const now = new Date();

  while (addMinutes(current, duration) <= slotEnd) {
    const slotEndTime = addMinutes(current, duration);

    // Skip past slots
    if (isAfter(now, current)) {
      current = addMinutes(current, duration);
      continue;
    }

    // Check for conflicts with existing bookings
    const hasConflict = existingBookings.some(booking => {
      const bStart = new Date(booking.startTime);
      const bEnd   = new Date(booking.endTime);
      return (
        (current >= bStart && current < bEnd) ||
        (slotEndTime > bStart && slotEndTime <= bEnd) ||
        (current <= bStart && slotEndTime >= bEnd)
      );
    });

    if (!hasConflict) {
      slots.push({
        startTime: current.toISOString(),
        endTime:   slotEndTime.toISOString(),
        label:     formatInTimeZone(current, timezone, 'h:mm a'),
      });
    }

    current = addMinutes(current, duration);
  }

  return slots;
}

/**
 * Get the day of week index (0=Sunday, 1=Monday...)
 */
export function getDayIndex(date) {
  return date.getDay();
}

/**
 * Format date for display
 */
export function formatDate(dateStr, fmt = 'MMMM d, yyyy') {
  return format(parseISO(dateStr), fmt);
}

/**
 * Get common IANA timezone list for dropdown
 */
export function getCommonTimezones() {
  return [
    { value: 'Pacific/Honolulu',    label: 'Hawaii (HST, UTC-10)' },
    { value: 'America/Anchorage',   label: 'Alaska (AKST, UTC-9)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PST, UTC-8)' },
    { value: 'America/Denver',      label: 'Mountain Time (MST, UTC-7)' },
    { value: 'America/Chicago',     label: 'Central Time (CST, UTC-6)' },
    { value: 'America/New_York',    label: 'Eastern Time (EST, UTC-5)' },
    { value: 'America/Sao_Paulo',   label: 'Brazil (BRT, UTC-3)' },
    { value: 'Atlantic/Azores',     label: 'Azores (AZOT, UTC-1)' },
    { value: 'UTC',                 label: 'UTC (UTC+0)' },
    { value: 'Europe/London',       label: 'London (GMT, UTC+0)' },
    { value: 'Europe/Paris',        label: 'Central Europe (CET, UTC+1)' },
    { value: 'Europe/Helsinki',     label: 'Eastern Europe (EET, UTC+2)' },
    { value: 'Europe/Moscow',       label: 'Moscow (MSK, UTC+3)' },
    { value: 'Asia/Dubai',          label: 'Dubai (GST, UTC+4)' },
    { value: 'Asia/Karachi',        label: 'Pakistan (PKT, UTC+5)' },
    { value: 'Asia/Kolkata',        label: 'India (IST, UTC+5:30)' },
    { value: 'Asia/Dhaka',          label: 'Bangladesh (BST, UTC+6)' },
    { value: 'Asia/Bangkok',        label: 'Bangkok (ICT, UTC+7)' },
    { value: 'Asia/Singapore',      label: 'Singapore (SGT, UTC+8)' },
    { value: 'Asia/Tokyo',          label: 'Japan (JST, UTC+9)' },
    { value: 'Australia/Sydney',    label: 'Sydney (AEST, UTC+10)' },
    { value: 'Pacific/Auckland',    label: 'New Zealand (NZST, UTC+12)' },
  ];
}

/**
 * Slugify a string (for event URLs)
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Default weekly availability template
 */
export function defaultAvailability() {
  return {
    sunday:    { enabled: false, start: '09:00', end: '17:00' },
    monday:    { enabled: true,  start: '09:00', end: '17:00' },
    tuesday:   { enabled: true,  start: '09:00', end: '17:00' },
    wednesday: { enabled: true,  start: '09:00', end: '17:00' },
    thursday:  { enabled: true,  start: '09:00', end: '17:00' },
    friday:    { enabled: true,  start: '09:00', end: '17:00' },
    saturday:  { enabled: false, start: '09:00', end: '17:00' },
  };
}

export const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const EVENT_COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#f97316', label: 'Orange' },
];
