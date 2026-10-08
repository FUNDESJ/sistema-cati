export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidCpf(value: string): boolean {
  const cpf = normalizeCpf(value);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split('').map(Number);

  const firstCheckDigit = computeCheckDigit(digits.slice(0, 9));
  if (digits[9] !== firstCheckDigit) return false;

  const secondCheckDigit = computeCheckDigit(digits.slice(0, 10));
  if (digits[10] !== secondCheckDigit) return false;

  return true;
}

function computeCheckDigit(base: number[]): number {
  const weightStart = base.length + 1;
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += base[i] * (weightStart - i);
  }
  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

export function formatCpf(value: string): string {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11) return value;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

export function maskCpf(value: string): string {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11) return 'CPF inválido';
  return `***.${cpf.slice(3, 6)}.***-${cpf.slice(9)}`;
}
