import { describe, expect, it } from 'vitest';
import { formatCpf, isValidCpf, maskCpf, normalizeCpf } from './cpf';

describe('normalizeCpf', () => {
  it('remove pontuação', () => {
    expect(normalizeCpf('123.456.789-09')).toBe('12345678909');
    expect(normalizeCpf('12345678909')).toBe('12345678909');
  });
});

describe('isValidCpf', () => {
  it('aceita CPF válido com pontuação', () => {
    expect(isValidCpf('123.456.789-09')).toBe(true);
  });

  it('aceita CPF válido sem pontuação', () => {
    expect(isValidCpf('12345678909')).toBe(true);
  });

  it('rejeita CPF com dígitos verificadores errados', () => {
    expect(isValidCpf('12345678900')).toBe(false);
  });

  it('rejeita CPFs com todos os dígitos iguais', () => {
    expect(isValidCpf('11111111111')).toBe(false);
    expect(isValidCpf('00000000000')).toBe(false);
  });

  it('rejeita tamanhos incorretos', () => {
    expect(isValidCpf('1234567890')).toBe(false);
    expect(isValidCpf('123456789012')).toBe(false);
    expect(isValidCpf('')).toBe(false);
  });

  it('rejeita valores não numéricos', () => {
    expect(isValidCpf('abc.def.ghi-jk')).toBe(false);
  });

  it('valida CPFs reais conhecidos (fictícios de teste)', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('168.995.350-09')).toBe(true);
  });
});

describe('formatCpf e maskCpf', () => {
  it('formata com máscara', () => {
    expect(formatCpf('12345678909')).toBe('123.456.789-09');
  });

  it('mascara o CPF minimizando exposição', () => {
    expect(maskCpf('12345678909')).toBe('***.456.***-09');
  });

  it('retorna aviso para CPF inválido', () => {
    expect(maskCpf('123')).toBe('CPF inválido');
  });
});
