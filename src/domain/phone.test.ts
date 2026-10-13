import { describe, expect, it } from 'vitest';
import { formatPhone, isValidPhone, maskPhone, normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('remove toda a formatação', () => {
    expect(normalizePhone('(48) 99999-9999')).toBe('48999999999');
    expect(normalizePhone('48999999999')).toBe('48999999999');
  });
});

describe('isValidPhone', () => {
  it('aceita celular válido com 11 dígitos', () => {
    expect(isValidPhone('48999999999')).toBe(true);
    expect(isValidPhone('(48) 99999-9999')).toBe(true);
    expect(isValidPhone('(11) 98765-4321')).toBe(true);
  });

  it('rejeita números com menos de 11 dígitos', () => {
    expect(isValidPhone('4899999999')).toBe(false);
    expect(isValidPhone('489999999')).toBe(false);
  });

  it('rejeita números com mais de 11 dígitos', () => {
    expect(isValidPhone('489999999999')).toBe(false);
  });

  it('rejeita DDD inválido (menor que 11)', () => {
    expect(isValidPhone('10999999999')).toBe(false);
    expect(isValidPhone('01999999999')).toBe(false);
  });

  it('rejeita dígitos repetidos', () => {
    expect(isValidPhone('99999999999')).toBe(false);
    expect(isValidPhone('11111111111')).toBe(false);
  });

  it('rejeita celular que não começa com 6-9 após o DDD', () => {
    expect(isValidPhone('48599999999')).toBe(false);
    expect(isValidPhone('48399999999')).toBe(false);
  });

  it('aceita celular começando com 6, 7, 8 ou 9', () => {
    expect(isValidPhone('48699999999')).toBe(true);
    expect(isValidPhone('48799999999')).toBe(true);
    expect(isValidPhone('48899999999')).toBe(true);
    expect(isValidPhone('48999999999')).toBe(true);
  });

  it('rejeita telefone fixo (10 dígitos)', () => {
    expect(isValidPhone('4833334444')).toBe(false);
  });

  it('rejeita valor vazio', () => {
    expect(isValidPhone('')).toBe(false);
  });

  it('rejeita letras e caracteres especiais', () => {
    expect(isValidPhone('48-99999-9999')).toBe(true);
    expect(isValidPhone('abcdefghijk')).toBe(false);
  });
});

describe('formatPhone', () => {
  it('formata com máscara progressiva', () => {
    expect(formatPhone('4')).toBe('4');
    expect(formatPhone('48')).toBe('48');
    expect(formatPhone('489')).toBe('(48) 9');
    expect(formatPhone('48999')).toBe('(48) 999');
    expect(formatPhone('4899999')).toBe('(48) 99999');
    expect(formatPhone('48999999')).toBe('(48) 9999-99');
  });

  it('formata celular completo', () => {
    expect(formatPhone('48999999999')).toBe('(48) 99999-9999');
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('não excede 11 dígitos', () => {
    expect(formatPhone('489999999999')).toBe('(48) 99999-9999');
  });
});

describe('maskPhone', () => {
  it('mascara o número mantendo apenas os 4 últimos dígitos', () => {
    expect(maskPhone('48999999999')).toBe('(XX) XXXXX-9999');
  });

  it('retorna aviso para número inválido', () => {
    expect(maskPhone('123')).toBe('Telefone inválido');
  });
});