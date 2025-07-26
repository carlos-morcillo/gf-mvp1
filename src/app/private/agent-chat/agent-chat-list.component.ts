import { Component, inject, input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { upperFirst } from 'lodash';
import {
  PaginableTableCellDirective,
  PaginableTableHeader,
  PaginableTableNotFoundDirective,
  TableComponent,
  TableRowEvent,
} from 'ng-hub-ui-table';
import { firstValueFrom } from 'rxjs';
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
    {
      property: null as any,
      buttons: [
        {
          tooltip: upperFirst(
            this.translocoSvc.translate('GENERIC.BUTTONS.REMOVE')
          ),
          icon: { type: 'font-awesome', value: 'fa-trash' },
          classlist: 'btn text-danger',
          handler: (event) =>
            this.delete((event as TableRowEvent<AgentChat>).data),
        },
      ],
    },
  ];

  /** Navigate to the selected chat */
  goToChat(event: TableRowEvent<AgentChat>): void {
    if (this.agentId()) {
      this.router.navigate(['/agents', this.agentId(), 'chats', event.data.id]);
    } else {
      this.router.navigate(['./', event.data.id], { relativeTo: this.route });
    }
  }

  /** Delete a chat with confirmation */
  //   @Confirmable({
  //     content: 'CHAT_LIST.CONFIRM.DELETE',
  //     confirmButtonText: 'GENERIC.BUTTONS.REMOVE',
  //     denyButtonText: 'GENERIC.BUTTONS.CANCEL',
  //   })
  override async delete(chat: AgentChat): Promise<void> {
    await firstValueFrom(this.dataSvc.deleteChat(String(chat.id)));
    this.paginatedData.reload();
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}
