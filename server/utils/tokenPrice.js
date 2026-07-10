export function isIndiaCountry(country) {
  if (!country) return false;
  const normalized = String(country).trim().toLowerCase();
  return normalized === 'india' || normalized === 'in';
}

export function getTokenPriceFields(dollarPrice, country) {
  const usd = Number(dollarPrice);
  const safeUsd = Number.isFinite(usd) ? usd : 0;

  if (isIndiaCountry(country)) {
    return {
      token_price: safeUsd * 100,
      token_price_currency: '₹'
    };
  }

  return {
    token_price: safeUsd,
    token_price_currency: '$'
  };
}
