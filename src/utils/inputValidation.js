const BRAZILIAN_AREA_CODES = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "51", "53", "54", "55",
  "61", "62", "63", "64", "65", "66", "67", "68", "69",
  "71", "73", "74", "75", "77", "79",
  "81", "82", "83", "84", "85", "86", "87", "88", "89",
  "91", "92", "93", "94", "95", "96", "97", "98", "99",
]);

export function isValidCPF(value) {
  const cpfInput = String(value || "").trim();
  if (!/^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(cpfInput)) return false;

  const cpf = cpfInput.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (digits, factor) => {
    const sum = digits
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * (factor - index), 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
  if (firstDigit !== Number(cpf[9])) return false;

  const secondDigit = calculateDigit(cpf.slice(0, 10), 11);
  return secondDigit === Number(cpf[10]);
}

export function isValidBrazilianPhone(value) {
  const phoneInput = String(value || "").trim();
  if (!/^[\d\s().-]+$/.test(phoneInput)) return false;

  const phone = phoneInput.replace(/\D/g, "");
  return (
    (phone.length === 10 || phone.length === 11) &&
    BRAZILIAN_AREA_CODES.has(phone.slice(0, 2))
  );
}

export function isValidEmail(value) {
  const email = String(value || "").trim();
  if (email.length > 254) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (
    !local ||
    local.length > 64 ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..") ||
    !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)
  ) {
    return false;
  }

  const labels = domain.split(".");
  return (
    labels.length >= 2 &&
    labels[labels.length - 1].length >= 2 &&
    labels.every(
      (label) =>
        label.length <= 63 &&
        /^[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?$/i.test(label),
    )
  );
}
