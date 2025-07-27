import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private dashboard = inject(DashboardService);
  private router = inject(Router);

  chats = this.dashboard.chats;
  agents = this.dashboard.agents;

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
