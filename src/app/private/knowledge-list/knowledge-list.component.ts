
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
import { KnowledgeBase } from './knowledge-base.model';
import { KnowledgeService } from './knowledge.service';

@Component({
  selector: 'app-knowledge-list',
  standalone: true,
  imports: [
    TableComponent,
    PaginableTableCellDirective,
    PaginableTableNotFoundDirective,
    RouterLink,
    TranslocoModule
],
  templateUrl: './knowledge-list.component.html',
})
export class KnowledgeListComponent extends PaginatedListComponent<KnowledgeBase> {
  override dataSvc = inject(KnowledgeService);

  override headers: PaginableTableHeader[] = [
    {
      title: this.translocoSvc.selectTranslate('KNOWLEDGE_LIST.COLUMNS.NAME'),
      property: 'name',
    },
    {
      title: this.translocoSvc.selectTranslate('KNOWLEDGE_LIST.COLUMNS.DESCRIPTION'),
      property: 'description',
    },
    {
      title: this.translocoSvc.selectTranslate('KNOWLEDGE_LIST.COLUMNS.CREATED_AT'),
      property: 'created_at',
    },
  ];

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }
}
