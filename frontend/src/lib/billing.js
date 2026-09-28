// Validación de identificación ecuatoriana para la factura del SRI.

function validProvince(digits) {
  const p = Number(digits.slice(0, 2));
  return (p >= 1 && p <= 24) || p === 30;
}

// Cédula: 10 dígitos, dígito verificador módulo 10.
export function isValidCedula(value) {
  if (!/^\d{10}$/.test(value) || !validProvince(value) || Number(value[2]) > 5) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let d = Number(value[i]) * (i % 2 === 0 ? 2 : 1);
    if (d > 9) d -= 9;
    sum += d;
  }
  return (10 - (sum % 10)) % 10 === Number(value[9]);
}

// RUC: 13 dígitos terminados en 001. Persona natural = cédula válida + 001;
// sociedades (tercer dígito 6 o 9) solo se revisa el formato en el demo.
export function isValidRuc(value) {
  if (!/^\d{13}$/.test(value) || !value.endsWith('001') || !validProvince(value)) return false;
  const third = Number(value[2]);
  if (third < 6) return isValidCedula(value.slice(0, 10));
  return third === 6 || third === 9;
}

export const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

// Monto máximo que el SRI permite facturar a "Consumidor final".
export const CONSUMIDOR_FINAL_MAX = 50;
