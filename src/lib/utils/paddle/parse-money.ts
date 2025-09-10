/**
 * Zero-decimal currencies that don't use cents (amounts are in whole currency units)
 */
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'KMF', 'XAF', 'XOF', 'XPF']);

/**
 * Converts amount from Paddle's lowest unit format to decimal format
 * @param amount - Amount as string in Paddle's format
 * @param currency - Currency code (e.g., 'USD', 'EUR', 'JPY')
 * @returns Amount in decimal format
 */
export function convertAmountFromLowestUnit(amount: string, currency: string): number {
  const numericAmount = parseFloat(amount);

  // For zero-decimal currencies, return as-is (no division by 100)
  if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) {
    return numericAmount;
  }

  // For most currencies, divide by 100 to convert from cents
  return numericAmount / 100;
}

/**
 * Parses and formats money amount with proper currency formatting
 * @param amount - Amount as string or number
 * @param currency - Currency code (defaults to 'USD')
 * @returns Formatted money string
 */
export function parseMoney(amount: string | number = '0', currency: string = 'USD'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const parsedAmount = convertAmountFromLowestUnit(numericAmount.toString(), currency);

  try {
    return formatMoney(parsedAmount, currency);
  } catch (error) {
    console.warn(`Failed to format currency ${currency}, falling back to basic formatting`);
    return `${parsedAmount.toFixed(2)} ${currency}`;
  }
}

/**
 * Formats a numeric amount with proper currency localization
 * @param amount - Numeric amount
 * @param currency - Currency code
 * @returns Localized currency string
 */
export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2,
    maximumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2,
  }).format(amount);
}

/**
 * Formats amount for display without currency symbol
 * @param amount - Amount as string or number
 * @param currency - Currency code
 * @returns Formatted amount string without currency symbol
 */
export function formatAmount(amount: string | number, currency: string): string {
  const parsedAmount = parseMoney(amount, currency);
  // Remove currency symbol and extra spaces
  return parsedAmount.replace(/[^\d.,]/g, '').trim();
}

/**
 * Checks if a currency is zero-decimal
 * @param currency - Currency code
 * @returns True if currency is zero-decimal
 */
export function isZeroDecimalCurrency(currency: string): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase());
}
