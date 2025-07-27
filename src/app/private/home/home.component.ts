import { Component, computed, inject, resource } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { firstValueFrom, map } from 'rxjs';
import { AgentChatService } from '../agent-chat/agent-chat.service';
import { AgentsService } from '../agent-list/agents.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslocoModule, ReactiveFormsModule, RouterLink],
  templateUrl: './home.component.html',
  host: {
    class: 'list-page list-page--container',
  },
})
export class HomeComponent {
  private router = inject(Router);
  private agentsSvc = inject(AgentsService);
  private chatsSvc = inject(AgentChatService);

  searchControl = new FormControl('');
  searchSignal = toSignal(this.searchControl.valueChanges);

  chats = resource({
    loader: () =>
      firstValueFrom(
        this.chatsSvc.paginate({ page: 1 }).pipe(map(({ data }) => data))
      ),
  });

  resultChats = computed(() => {
    const searchTerm = this.searchSignal()?.toLowerCase() ?? '';
    if (!searchTerm || !this.chats.hasValue()) {
      return [];
    }
    return (
      this.chats
        .value()
        ?.filter((chat) => chat.title.toLowerCase().includes(searchTerm)) ?? []
    );
  });

  agents = resource({
    loader: () =>
      firstValueFrom(
        this.agentsSvc.paginate({ page: 1 }).pipe(map(({ data }) => data))
      ),
  });

  resultAgents = computed(() => {
    const searchTerm = this.searchSignal()?.toLowerCase() ?? '';
    if (!searchTerm || !this.agents.hasValue()) {
      return [];
    }
    return (
      this.agents
        .value()
        ?.filter((agent) => agent.name.toLowerCase().includes(searchTerm)) ?? []
    );
  });

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  openChat(id: string): void {
    this.router.navigate(['/private/chats', id]);
  }

  openAgent(id: string): void {
    this.router.navigate(['/private/agents', id]);
  }

  openNewAgent(): void {
    this.router.navigate(['/private/agents', 'add']);
  }

  exploreMarketplace(): void {
    // placeholder for future action
  }

  viewFavorites(): void {
    // placeholder for future action
  }

  timeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Hace segundos';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Hace ${days} d`;
    return new Date(timestamp).toLocaleDateString();
  }
}
