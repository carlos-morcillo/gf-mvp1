import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
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
    CommonModule,
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

  override headers: PaginableTableHeader[] = [
    { title: this.translocoSvc.selectTranslate('AGENT_CHAT_LIST.COLUMNS.ID'), property: 'id' },
    { title: this.translocoSvc.selectTranslate('AGENT_CHAT_LIST.COLUMNS.AGENT'), property: 'agent' },
    { title: this.translocoSvc.selectTranslate('AGENT_CHAT_LIST.COLUMNS.UPDATED'), property: 'updated_at' },
  ];

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}
