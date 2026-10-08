import { describe, expect, it } from 'vitest';
import {
  REFERENCE_DATE,
  ageAtReferenceDate,
  calculateAge,
  isEligibleAge,
  isPriorityAge,
  parseBirthDate,
} from './age';

describe('parseBirthDate', () => {
  it('aceita formato ISO', () => {
    expect(parseBirthDate('1950-03-10')).toEqual(new Date(1950, 2, 10));
  });

  it('aceita formato brasileiro', () => {
    expect(parseBirthDate('10/03/1950')).toEqual(new Date(1950, 2, 10));
  });

  it('rejeita formatos inválidos', () => {
    expect(parseBirthDate('1950/03/10')).toBeNull();
    expect(parseBirthDate('abc')).toBeNull();
    expect(parseBirthDate('')).toBeNull();
  });

  it('rejeita datas inexistentes', () => {
    expect(parseBirthDate('1950-02-30')).toBeNull();
    expect(parseBirthDate('1950-13-01')).toBeNull();
    expect(parseBirthDate('1950-00-10')).toBeNull();
  });
});

describe('calculateAge', () => {
  it('calcula idade considerando mês e dia', () => {
    expect(calculateAge(new Date(1950, 2, 10), REFERENCE_DATE)).toBe(76);
    expect(calculateAge(new Date(1950, 0, 3), REFERENCE_DATE)).toBe(77);
  });

  it('no dia exato do aniversário já conta a idade completa', () => {
    expect(calculateAge(new Date(1950, 0, 5), REFERENCE_DATE)).toBe(77);
  });

  it('um dia antes do aniversário ainda não conta', () => {
    expect(calculateAge(new Date(1950, 0, 4), REFERENCE_DATE)).toBe(77);
  });
});

describe('ageAtReferenceDate', () => {
  it('calcula a partir da data de referência de 05/01/2027', () => {
    expect(ageAtReferenceDate('1946-12-20')).toBe(80);
    expect(ageAtReferenceDate('1947-01-04')).toBe(80);
    expect(ageAtReferenceDate('1947-01-05')).toBe(80);
  });

  it('retorna null para data inválida', () => {
    expect(ageAtReferenceDate('inválido')).toBeNull();
  });
});

describe('elegibilidade e prioridade', () => {
  it('60 anos ou mais é elegível', () => {
    expect(isEligibleAge(60)).toBe(true);
    expect(isEligibleAge(85)).toBe(true);
    expect(isEligibleAge(59)).toBe(false);
  });

  it('80 anos ou mais tem prioridade', () => {
    expect(isPriorityAge(80)).toBe(true);
    expect(isPriorityAge(90)).toBe(true);
    expect(isPriorityAge(79)).toBe(false);
  });
});
