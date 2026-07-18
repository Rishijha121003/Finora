// Finora Currency Formatting Helper

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export function formatCurrency(amount, currencyCode = 'INR') {
  const numericAmount = parseFloat(amount) || 0;
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  
  if (currencyCode === 'INR') {
    // Format according to Indian Numbering System (e.g. ₹ 1,50,000.00)
    const parts = numericAmount.toFixed(2).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];
    
    const isNegative = integerPart.startsWith('-');
    if (isNegative) integerPart = integerPart.substring(1);

    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    
    return `${isNegative ? '-' : ''}${symbol} ${formattedInteger}.${decimalPart}`;
  } else {
    // Standard International Formatting
    return `${symbol} ${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
