export const SAO_JOSE_NEIGHBORHOODS = [
  'Alto Forquilhas',
  'Areias',
  'Barreiros',
  'Bela Vista',
  'Bosque das Mansões',
  'Campinas',
  'Centro Histórico',
  'Colônia Santana',
  'Distrito Industrial',
  'Fazenda Santo Antônio',
  'Flor de Nápolis',
  'Floresta',
  'Forquilhas do Leste',
  'Forquilhas do Oeste',
  'Forquilhinhas',
  'Ipiranga',
  'Jardim Cidade de Florianópolis',
  'Jardim Santiago',
  'Kobrasol',
  'Nossa Senhora do Rosário',
  'Pagará',
  'Pedregal',
  'Picadas do Sul',
  'Ponta de Baixo',
  'Potecas',
  'Praia Comprida',
  'Real Parque',
  'Roçado',
  'São Luiz',
  'Serraria',
  'Sertão do Maruim',
] as const;

export type Neighborhood = (typeof SAO_JOSE_NEIGHBORHOODS)[number];

export function isSaoJoseNeighborhood(value: string): value is Neighborhood {
  return (SAO_JOSE_NEIGHBORHOODS as readonly string[]).includes(value);
}