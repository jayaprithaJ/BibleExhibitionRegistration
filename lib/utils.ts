import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parse } from 'date-fns';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM d, yyyy');
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  const timeObj = parse(time, 'HH:mm:ss', new Date());
  return format(timeObj, 'h:mm a');
}

/**
 * Format date and time together
 */
export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)} at ${formatTime(time)}`;
}

/**
 * Get day name from date
 */
export function getDayName(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE');
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Get status color based on fill percentage
 */
export function getStatusColor(fillPercentage: number): string {
  if (fillPercentage >= 100) return 'red';
  if (fillPercentage >= 80) return 'yellow';
  return 'green';
}

/**
 * Get status text based on fill percentage
 */
export function getStatusText(fillPercentage: number): string {
  if (fillPercentage >= 100) return 'Fully Booked';
  if (fillPercentage >= 80) return 'Filling Fast';
  return 'Available';
}

/**
 * Calculate wait time between two times
 */
export function calculateWaitTime(time1: string, time2: string): number {
  const t1 = parse(time1, 'HH:mm:ss', new Date());
  const t2 = parse(time2, 'HH:mm:ss', new Date());
  return Math.abs((t2.getTime() - t1.getTime()) / 60000);
}

/**
 * Format wait time for display
 */
export function formatWaitTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
}

/**
 * Validate environment variables
 */
export function validateEnv() {
  const required = ['DATABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Sleep utility for testing
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Made with Bob
