export function isIndiaCountry(country) {
  if (!country) return false;
  const normalized = String(country).trim().toLowerCase();
  return normalized === 'india' || normalized === 'in';
}

export function formatGamePrice(amount, country) {
  const num = Number(amount);
  const safeAmount = Number.isFinite(num) ? num : 0;

  if (isIndiaCountry(country)) {
    return `₹ ${safeAmount * 100}`;
  }

  return `US$ ${safeAmount}`;
}
