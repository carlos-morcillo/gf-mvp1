import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import {
  PaginableTableCellDirective,
  PaginableTableHeader,
  PaginableTableNotFoundDirective,
  TableComponent,
} from 'ng-hub-ui-table';

import { RouterLink } from '@angular/router';
import { PaginatedListComponent } from '../../shared/components/paginated-list.component';
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
})
export class AgentListComponent extends PaginatedListComponent<Agent> {
  /** Service responsible for fetching agent data */
  override dataSvc = inject(AgentsService);

  /** Table column definitions */
  override headers: PaginableTableHeader[] = [
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
  ];

  /**
   * Builds a readable summary for the agent capabilities.
   */
  summarizeCapabilities(capabilities: Record<string, any>): Array<string> {
    return Object.keys(capabilities || {}).filter((key) => capabilities[key]);
  }
}
