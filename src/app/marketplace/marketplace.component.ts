import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AvatarComponent } from 'ng-hub-ui-avatar';
import {
  PaginableTableCellDirective,
  PaginableTableHeader,
  PaginableTableNotFoundDirective,
  TableComponent,
  TableRowEvent,
} from 'ng-hub-ui-table';
import { PaginatedListComponent } from '../shared/components/paginated-list.component';
import { MarketplaceAgent } from './marketplace-agent.model';
import { MarketplaceService } from './marketplace.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    PaginableTableCellDirective,
    PaginableTableNotFoundDirective,
    RouterLink,
    TranslocoModule,
    AvatarComponent,
  ],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.scss',
  host: {
    class: 'list-page list-page--container',
  },
})
export class MarketplaceComponent extends PaginatedListComponent<MarketplaceAgent> {
  override dataSvc = inject(MarketplaceService);
  private router = inject(Router);

  override headers: PaginableTableHeader[] = [
    { property: 'info.meta.profile_image_url' },
    {
      title: this.translocoSvc.selectTranslate('MARKETPLACE.COLUMNS.NAME'),
      property: 'name',
    },
    {
      title: this.translocoSvc.selectTranslate(
        'MARKETPLACE.COLUMNS.DESCRIPTION'
      ),
      property: 'info.meta.description',
    },
  ];

  goToAgent({ data }: TableRowEvent<MarketplaceAgent>): void {
    this.router.navigate(['/private/agents', data.id]);
  }
}
