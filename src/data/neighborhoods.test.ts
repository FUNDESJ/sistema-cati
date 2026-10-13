import { describe, expect, it } from 'vitest';
import { SAO_JOSE_NEIGHBORHOODS, isSaoJoseNeighborhood } from './neighborhoods';

describe('SAO_JOSE_NEIGHBORHOODS', () => {
  it('contém todos os 31 bairros oficiais de São José', () => {
    expect(SAO_JOSE_NEIGHBORHOODS).toHaveLength(31);
  });

  it('inclui bairros específicos da lista oficial', () => {
    expect(SAO_JOSE_NEIGHBORHOODS).toContain('Alto Forquilhas');
    expect(SAO_JOSE_NEIGHBORHOODS).toContain('Centro Histórico');
    expect(SAO_JOSE_NEIGHBORHOODS).toContain('Kobrasol');
    expect(SAO_JOSE_NEIGHBORHOODS).toContain('Sertão do Maruim');
    expect(SAO_JOSE_NEIGHBORHOODS).toContain('Praia Comprida');
  });

  it('não contém valores duplicados', () => {
    const unique = new Set(SAO_JOSE_NEIGHBORHOODS);
    expect(unique.size).toBe(SAO_JOSE_NEIGHBORHOODS.length);
  });
});

describe('isSaoJoseNeighborhood', () => {
  it('aceita bairros válidos', () => {
    expect(isSaoJoseNeighborhood('Barreiros')).toBe(true);
    expect(isSaoJoseNeighborhood('Campinas')).toBe(true);
  });

  it('rejeita bairros fora da lista', () => {
    expect(isSaoJoseNeighborhood('Florianópolis')).toBe(false);
    expect(isSaoJoseNeighborhood('')).toBe(false);
    expect(isSaoJoseNeighborhood('Bairro Inexistente')).toBe(false);
  });
});