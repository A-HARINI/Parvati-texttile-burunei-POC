export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEmail(email) {
  if (!isNonEmptyString(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidMobile(mobile) {
  if (!isNonEmptyString(mobile)) return false;
  const digits = mobile.replace(/\D/g, '');
  return digits.length >= 10;
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
