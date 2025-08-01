import {
  Component,
  inject,
  input,
  OnInit,
  resource,
  signal,
} from '@angular/core';
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
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, map } from 'rxjs';
import { ChatService } from '../../chat/chat.service';
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
  styleUrls: ['./agent-chat-list.component.scss'],
  host: {
    class: 'list-page list-page--container',
  },
})
export class AgentChatListComponent
  extends PaginatedListComponent<AgentChat>
  implements OnInit
{
  override dataSvc = inject(AgentChatService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private chatSvc = inject(ChatService);
  private toastrSvc = inject(ToastrService);

  /** Track chats currently being processed */
  loadingPins = signal<Set<string>>(new Set());

  override paginatedData = resource({
    params: () => ({
      ...this.request(),
      pinnedChats: this.chatSvc.pinnedChats.value(),
    }),
    loader: ({ params: { pinnedChats } }) =>
      firstValueFrom(
        this.fetchFn().pipe(
          map((result) => {
            for (const item of result.data ?? []) {
              item.pinned = !!pinnedChats?.find((chat) => chat.id === item.id);
            }
            return result;
          })
        )
      ),
  });

  /** Determine if a chat is pinned */
  isPinned = (chat: AgentChat) => {
    console.log(chat.title, this.chatSvc.isPinned(chat.id));
    return this.chatSvc.isPinned(chat.id);
  };

  /** Toggle pin state of a chat */
  async togglePin(chat: AgentChat): Promise<void> {
    const id = String(chat.id);
    this.loadingPins.update((set) => new Set(set).add(id));
    const currentlyPinned = this.isPinned(chat);
    try {
      await this.chatSvc.toggleChatPin(id);
      this.toastrSvc.success(
        this.translocoSvc.translate(
          currentlyPinned
            ? 'CHATLIST.MESSAGES.UNPIN_SUCCESS'
            : 'CHATLIST.MESSAGES.PIN_SUCCESS'
        )
      );
    } catch {
      this.toastrSvc.error(
        this.translocoSvc.translate(
          currentlyPinned
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
      property: 'pinned',
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
