import { Component, inject, input, signal } from '@angular/core';
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
import { ChatService } from '../../chat/chat.service';
import { PaginatedListComponent } from '../../shared/components/paginated-list.component';
import { Toast } from '../../shared/services/toast.service';
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
  styleUrls: ['./agent-chat-list.component.scss'],
  host: {
    class: 'list-page list-page--container',
  },
})
export class AgentChatListComponent extends PaginatedListComponent<AgentChat> {
  override dataSvc = inject(AgentChatService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private chatSvc = inject(ChatService);

  /** Track chats currently being processed */
  loadingPins = signal<Set<string>>(new Set());

  /** Determine if a chat is pinned */
  isPinned = (chat: AgentChat) => {
    return this.chatSvc.isPinned(chat.id);
  };

  /** Toggle pin state of a chat */
  async togglePin(chat: AgentChat): Promise<void> {
    const id = String(chat.id);
    this.loadingPins.update((set) => new Set(set).add(id));
    try {
      if (this.isPinned(chat)) {
        await this.chatSvc.unpinChat(id);
        Toast.success(
          this.translocoSvc.translate('CHATLIST.MESSAGES.UNPIN_SUCCESS')
        );
      } else {
        await this.chatSvc.pinChat(id);
        Toast.success(
          this.translocoSvc.translate('CHATLIST.MESSAGES.PIN_SUCCESS')
        );
      }
    } catch {
      Toast.error(
        this.translocoSvc.translate(
          this.isPinned(chat)
            ? 'CHATLIST.MESSAGES.UNPIN_ERROR'
            : 'CHATLIST.MESSAGES.PIN_ERROR'
        )
      );
    } finally {
      this.loadingPins.update((set) => {
        const newSet = new Set(set);
        newSet.delete(id);
        return newSet;
      });
    }
  }

  /** Currently selected agent identifier */
  agentId = input(null, { alias: 'agentId' });

  override headers: PaginableTableHeader[] = [
    {
      title: '',
      property: 'pin',
      sortable: false,
    },
    {
      title: this.translocoSvc.selectTranslate('AGENT_CHAT_LIST.COLUMNS.TITLE'),
      property: 'title',
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
          icon: { type: 'bootstrap', value: 'bi-trash3' },
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
