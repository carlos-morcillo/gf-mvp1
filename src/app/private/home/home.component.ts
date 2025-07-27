import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, firstValueFrom } from 'rxjs';
import { AgentsService } from '../agent-list/agents.service';
import { AgentChatService } from '../agent-chat/agent-chat.service';
import { Agent } from '../agent-list/agent';
import { AgentChat } from '../agent-chat/agent-chat.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslocoModule, RouterLink, ReactiveFormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private agentsSvc = inject(AgentsService);
  private chatsSvc = inject(AgentChatService);

  chats: WritableSignal<AgentChat[]> = signal([]);
  agents: WritableSignal<Agent[]> = signal([]);
  searchControl = new FormControl('');
  showResults = signal(false);
  resultAgents: WritableSignal<Agent[]> = signal([]);
  resultChats: WritableSignal<AgentChat[]> = signal([]);

  async ngOnInit(): Promise<void> {
    const [agents, chats] = await Promise.all([
      firstValueFrom(this.agentsSvc.list()),
      firstValueFrom(this.chatsSvc.list({ page: 1 })),
    ]);
    this.agents.set(agents);
    this.chats.set(chats.sort((a, b) => b.updated_at - a.updated_at));

    this.searchControl.valueChanges.subscribe((val) => {
      this.showResults.set(!!val);
      if (!val) {
        this.resultAgents.set([]);
        this.resultChats.set([]);
      }
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(1000))
      .subscribe((term) => this.performSearch(term ?? ''));
  }

  private async performSearch(term: string): Promise<void> {
    if (!term) return;
    const [agents, chats] = await Promise.all([
      firstValueFrom(this.agentsSvc.list()),
      firstValueFrom(this.chatsSvc.searchChats(term)),
    ]);
    this.resultAgents.set(
      agents.filter((a) =>
        a.name.toLowerCase().includes(term.toLowerCase())
      )
    );
    this.resultChats.set(chats.sort((a, b) => b.updated_at - a.updated_at));
  }

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
