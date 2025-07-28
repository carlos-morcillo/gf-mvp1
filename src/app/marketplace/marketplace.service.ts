import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CollectionService } from '../shared/services';
import { PagedDataRequestParam } from '../shared/types/paged-data-request-param';
import { MarketplaceAgent } from './marketplace-agent.model';

@Injectable({ providedIn: 'root' })
export class MarketplaceService extends CollectionService<MarketplaceAgent> {
  protected override path = 'models';

  override list(
    request: Partial<PagedDataRequestParam> = {}
  ): Observable<MarketplaceAgent[]> {
    return this.http.get<MarketplaceAgent[]>(`${environment.baseURL}/${this.path}/`);
  }
}
