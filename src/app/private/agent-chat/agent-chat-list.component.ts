
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { map } from 'rxjs/operators';
import {
  PaginableTableCellDirective,
  PaginableTableHeader,
  PaginableTableNotFoundDirective,
  TableComponent,
} from 'ng-hub-ui-table';
import { PaginatedListComponent } from '../../shared/components/paginated-list.component';
import { AgentChat } from './agent-chat.model';
import { AgentChatService } from './agent-chat.service';

@Component({
  selector: 'app-agent-chat-list',
  standalone: true,
  imports: [
    TableComponent,
    PaginableTableCellDirective,
    PaginableTableNotFoundDirective,
    RouterLink,
    TranslocoModule
],
  templateUrl: './agent-chat-list.component.html',
})
export class AgentChatListComponent extends PaginatedListComponent<AgentChat> {
  override dataSvc = inject(AgentChatService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Currently selected agent identifier */
  agentId = '';

  override headers: PaginableTableHeader[] = [
    { title: this.translocoSvc.selectTranslate('AGENT_CHAT_LIST.COLUMNS.ID'), property: 'id' },
    { title: this.translocoSvc.selectTranslate('AGENT_CHAT_LIST.COLUMNS.AGENT'), property: 'agent' },
    { title: this.translocoSvc.selectTranslate('AGENT_CHAT_LIST.COLUMNS.UPDATED'), property: 'updated_at' },
  ];

  /**
   * Initializes component state and listens to route parameter changes
   * in order to filter chats by agent id.
   */
  override ngOnInit(): void {
    super.ngOnInit();
    this.route.paramMap.subscribe((params) => {
      this.agentId = params.get('agentId') ?? '';
      this.paginatedData.reload();
    });
  }

  /**
   * Overrides the default data fetcher so results are filtered by agent.
   */
  override fetchFn() {
    return this.dataSvc
      .list()
      .pipe(map((chats) => chats.filter((c) => !this.agentId || c.agent === this.agentId)));
  }

  /** Navigate to the selected chat */
  goToChat(chatId: string): void {
    this.router.navigate(['/agents', this.agentId, 'chats', chatId]);
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}
