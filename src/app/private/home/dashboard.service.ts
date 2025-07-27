import { Injectable, signal } from '@angular/core';

export interface DashboardChat {
  id: string;
  title: string;
  agentName: string;
  updatedAt: number;
  active?: boolean;
  avatar?: string;
}

export interface DashboardAgent {
  id: string;
  name: string;
  avatar?: string;
  type: 'global' | 'personal';
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  chats = signal<DashboardChat[]>([
    {
      id: '1',
      title: 'Ejemplo de conversación',
      agentName: 'Agente Uno',
      updatedAt: Date.now() - 3600 * 1000,
      active: true,
    },
    {
      id: '2',
      title: 'Consulta sobre ventas',
      agentName: 'Agente Dos',
      updatedAt: Date.now() - 86400 * 1000,
    },
  ]);

  agents = signal<DashboardAgent[]>([
    {
      id: '1',
      name: 'Agente Uno',
      type: 'global',
    },
    {
      id: '2',
      name: 'Agente Dos',
      type: 'personal',
    },
  ]);
}
