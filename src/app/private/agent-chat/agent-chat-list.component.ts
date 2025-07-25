import { Component, inject, input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import {
  PaginableTableCellDirective,
  PaginableTableHeader,
  PaginableTableNotFoundDirective,
  TableComponent,
  TableRowEvent,
} from 'ng-hub-ui-table';
import { map } from 'rxjs/operators';
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
    TranslocoModule,
  ],
  templateUrl: './agent-chat-list.component.html',
})
export class AgentChatListComponent extends PaginatedListComponent<AgentChat> {
  override dataSvc = inject(AgentChatService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Currently selected agent identifier */
  agentId = input(null, { alias: 'agentId' });

  override headers: PaginableTableHeader[] = [
    {
      title: this.translocoSvc.selectTranslate('AGENT_CHAT_LIST.COLUMNS.ID'),
      property: 'id',
    },
    {
      title: this.translocoSvc.selectTranslate('AGENT_CHAT_LIST.COLUMNS.AGENT'),
      property: 'agent',
    },
    {
      title: this.translocoSvc.selectTranslate(
        'AGENT_CHAT_LIST.COLUMNS.UPDATED'
      ),
      property: 'updated_at',
    },
  ];

  /**
   * Overrides the default data fetcher so results are filtered by agent.
   */
  override fetchFn() {
    return this.dataSvc
      .list()
      .pipe(
        map((chats) =>
          chats.filter((c) => !this.agentId || c.agent === this.agentId())
        )
      );
  }

  /** Navigate to the selected chat */
  goToChat(event: TableRowEvent<AgentChat>): void {
    if (this.agentId()) {
      this.router.navigate(['/agents', this.agentId(), 'chats', event.data.id]);
    } else {
      this.router.navigate(['./', event.data.id], { relativeTo: this.route });
    }
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}
