export const REFERENCE_DATE = new Date(2027, 0, 5);

export const MIN_ELIGIBLE_AGE = 60;
export const PRIORITY_AGE = 80;

export function parseBirthDate(value: string): Date | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (iso) {
    const [, y, m, d] = iso;
    return buildDate(Number(y), Number(m), Number(d));
  }

  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (br) {
    const [, d, m, y] = br;
    return buildDate(Number(y), Number(m), Number(d));
  }

  return null;
}

function buildDate(year: number, month: number, day: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function calculateAge(
  birthDate: Date,
  reference: Date = REFERENCE_DATE,
): number {
  let age = reference.getFullYear() - birthDate.getFullYear();
  const monthDiff = reference.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function ageAtReferenceDate(
  birthDateValue: string,
  reference: Date = REFERENCE_DATE,
): number | null {
  const birthDate = parseBirthDate(birthDateValue);
  if (!birthDate) return null;
  return calculateAge(birthDate, reference);
}

export function isEligibleAge(age: number): boolean {
  return age >= MIN_ELIGIBLE_AGE;
}

export function isPriorityAge(age: number): boolean {
  return age >= PRIORITY_AGE;
}
