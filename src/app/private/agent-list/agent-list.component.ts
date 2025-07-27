import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import {
  PaginableTableCellDirective,
  PaginableTableHeader,
  PaginableTableNotFoundDirective,
  TableComponent,
  TableRowEvent,
} from 'ng-hub-ui-table';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { upperFirst } from 'lodash';
import { firstValueFrom } from 'rxjs';
import { PaginatedListComponent } from '../../shared/components/paginated-list.component';
import { PinnedAgentsService } from '../../shared/services';
import { Agent } from './agent';
import { AgentsService } from './agents.service';

/**
 * Displays a paginated list of agents using `ng-hub-ui-table`.
 */
@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    PaginableTableCellDirective,
    PaginableTableNotFoundDirective,
    TranslocoModule,
    RouterLink,
  ],
  templateUrl: './agent-list.component.html',
  host: {
    class: 'list-page list-page--container',
  },
})
export class AgentListComponent extends PaginatedListComponent<Agent> {
  /** Service responsible for fetching agent data */
  override dataSvc = inject(AgentsService);
  pinnedSvc = inject(PinnedAgentsService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  /** Table column definitions */
  override headers: PaginableTableHeader[] = [
    {
      title: '',
      property: 'pin',
      sortable: false,
      buttons: [
        {
          tooltip: 'Pin',
          icon: { type: 'font-awesome', value: 'fa fa-thumbtack' },
          classlist: 'btn btn-link p-0',
          handler: (e) => this.togglePin((e as TableRowEvent<Agent>).data),
        },
      ],
    },
    {
      title: this.translocoSvc.selectTranslate('AGENT_LIST.COLUMNS.NAME'),
      property: 'name',
    },
    {
      title: this.translocoSvc.selectTranslate('AGENT_LIST.COLUMNS.MODEL'),
      property: 'base_model_id',
    },
    {
      title: this.translocoSvc.selectTranslate('AGENT_LIST.COLUMNS.FEATURES'),
      property: 'meta.capabilities',
    },
    {
      title: '',
      property: 'chat',
      sortable: false,
      buttons: [
        {
          tooltip: this.translocoSvc.translate('AGENT_CHAT.NEW_BUTTON'),
          icon: { type: 'font-awesome', value: 'fa-message' },
          classlist: 'btn text-secondary',
          handler: (e) => this.startChat((e as TableRowEvent<Agent>).data.id!),
        },
      ],
    },
    {
      property: null as any,
      buttons: [
        {
          tooltip: upperFirst(
            this.translocoSvc.translate('GENERIC.BUTTONS.REMOVE')
          ),
          icon: {
            type: 'font-awesome',
            value: 'fa-trash',
          },
          classlist: 'btn text-danger',
          handler: (event) => this.delete((event as TableRowEvent<Agent>).data),
        },
      ],
    },
  ];

  /**
   * Builds a readable summary for the agent capabilities.
   */
  summarizeCapabilities(capabilities: Record<string, any>): Array<string> {
    return Object.keys(capabilities || {}).filter((key) => capabilities[key]);
  }

  /** Toggle agent pinned state */
  togglePin(agent: Agent): void {
    this.pinnedSvc.toggle({ id: agent.id!, name: agent.name });
  }

  /** Check if given agent is pinned */
  isPinned(agent: Agent): boolean {
    return this.pinnedSvc.isPinned(agent.id!);
  }

  /** Navigate to the new chat route for a given agent */
  startChat(agentId: string): void {
    this.router.navigate(['./', agentId, 'chats', 'add'], {
      relativeTo: this.route,
    });
  }

  /** Navigate to chat list for the selected agent */
  openChats(agentId: string): void {
    this.router.navigate(['./', agentId, 'chats'], { relativeTo: this.route });
  }

  /** Delete selected agent with confirmation */
  //   @Confirmable({
  //     content: 'AGENT_LIST.CONFIRM.DELETE',
  //     confirmButtonText: 'GENERIC.BUTTONS.REMOVE',
  //     denyButtonText: 'GENERIC.BUTTONS.CANCEL',
  //   })
  override async delete(agent: Agent): Promise<void> {
    await firstValueFrom(this.dataSvc.deleteAgent(agent.id!));
    this.paginatedData.reload();
  }

  /** Navigate to agent edition on row click */
  goToAgent({ data }: { data: Agent }): void {
    this.router.navigate(['./', data.id], { relativeTo: this.route });
  }
}
