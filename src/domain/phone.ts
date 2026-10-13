export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidPhone(value: string): boolean {
  const phone = normalizePhone(value);

  if (phone.length !== 10 && phone.length !== 11) return false;

  // DDD válido (11-99)
  const ddd = Number(phone.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  // Número não pode ser todos dígitos iguais
  if (/^(\d)\1{9,10}$/.test(phone)) return false;

  // Celular brasileiro: 9 dígitos após o DDD, começando com 9 (desde 2012 em todo o país)
  if (phone.length === 11) {
    const prefix = Number(phone.slice(2, 3));
    return prefix >= 6 && prefix <= 9;
  }

  // Fixo de 10 dígitos: não aceitamos (o campo é de celular)
  return false;
}

export function formatPhone(value: string): string {
  const phone = normalizePhone(value);

  if (phone.length <= 2) return phone;
  if (phone.length <= 7) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
  if (phone.length <= 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7, 11)}`;
}

export function maskPhone(value: string): string {
  const phone = normalizePhone(value);
  if (phone.length !== 10 && phone.length !== 11) return 'Telefone inválido';
  const suffix = phone.slice(-4);
  return `(XX) XXXXX-${suffix}`;
}