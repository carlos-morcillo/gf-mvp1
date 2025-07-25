import { Injectable, signal } from '@angular/core';
import { Agent } from '../../private/agent-list/agent';

/** Service to manage pinned agents stored in localStorage */
@Injectable({ providedIn: 'root' })
export class PinnedAgentsService {
  /** Reactive list of pinned agents with id and name */
  readonly pinned = signal<Array<Pick<Agent, 'id' | 'name'>>>(this.load());

  /** Toggle pin state of an agent and persist the list */
  toggle(agent: Pick<Agent, 'id' | 'name'>): void {
    const list = [...this.pinned()];
    const index = list.findIndex((a) => a.id === agent.id);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push({ id: agent.id, name: agent.name });
    }
    this.pinned.set(list);
    localStorage.setItem('pinnedAgents', JSON.stringify(list));
  }

  /** Checks if an agent is pinned */
  isPinned(id: string | number | null | undefined): boolean {
    return this.pinned().some((a) => a.id === id);
  }

  private load(): Array<Pick<Agent, 'id' | 'name'>> {
    try {
      return JSON.parse(localStorage.getItem('pinnedAgents') || '[]');
    } catch {
      return [];
    }
  }
}
