import type { Activity } from '../types';

export const ACTIVITIES: Activity[] = [
  { id: 'danca-salao', name: 'Dança de Salão', groupId: 1 },
  { id: 'danca-ritmos', name: 'Dança Ritmos', groupId: 1 },
  { id: 'ginastica', name: 'Ginástica', groupId: 1 },
  { id: 'ginastica-cadeira', name: 'Ginástica na Cadeira', groupId: 1 },
  { id: 'hidroginastica', name: 'Hidroginástica', groupId: 1 },
  { id: 'alongamento-autonomia', name: 'Alongamento e Autonomia', groupId: 1 },
  { id: 'ginastica-dance', name: 'Ginástica/Dance', groupId: 1 },
  { id: 'teatro', name: 'Teatro', groupId: 2 },
  { id: 'canto', name: 'Canto', groupId: 2 },
  { id: 'ceramica', name: 'Cerâmica', groupId: 2 },
];

export function getActivityById(id: string): Activity | undefined {
  return ACTIVITIES.find((activity) => activity.id === id);
}

export function getActivitiesByGroup(groupId: 1 | 2): Activity[] {
  return ACTIVITIES.filter((activity) => activity.groupId === groupId);
}
