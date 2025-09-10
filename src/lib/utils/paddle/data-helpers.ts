import { CheckoutEventsTimePeriod } from '@paddle/paddle-js';

/**
 * Deep clones SDK responses to avoid serialization issues
 * @param response - The response object to parse
 * @returns Deep cloned response
 */
export function parseSDKResponse<T>(response: T): T {
  return JSON.parse(JSON.stringify(response));
}

/**
 * Error message constant for consistent error handling
 */
export const ErrorMessage = 'Something went wrong, please try again later';

/**
 * Maps of billing cycle intervals for display
 */
export const BillingCycleMap: Record<string, string> = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  year: 'yearly',
};

export const CustomBillingCycleMap: Record<string, string> = {
  day: 'days',
  week: 'weeks',
  month: 'months',
  year: 'years',
};

/**
 * Formats billing cycle information for display
 * @param timePeriod - Paddle time period object
 * @returns Human-readable billing cycle string
 */
export function formatBillingCycle({
  frequency,
  interval
}: CheckoutEventsTimePeriod): string {
  if (frequency === 1) {
    return BillingCycleMap[interval] || interval;
  } else {
    return `every ${frequency} ${CustomBillingCycleMap[interval] || interval}`;
  }
}

/**
 * Generic error response structure
 */
export interface ErrorResponse {
  error: string;
}

/**
 * Generic success response structure
 */
export interface SuccessResponse<T> {
  data: T;
}

/**
 * Union type for API responses
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Type guard to check if response has error
 */
export function isErrorResponse<T>(response: ApiResponse<T>): response is ErrorResponse {
  return 'error' in response;
}

/**
 * Type guard to check if response has data
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return 'data' in response;
}
