import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CollectionService } from '../../shared/services';
import { PagedDataRequestParam } from '../../shared/types/paged-data-request-param';
import { KnowledgeBase } from './knowledge-base.model';

@Injectable({ providedIn: 'root' })
export class KnowledgeService extends CollectionService<KnowledgeBase> {
  protected override path = 'knowledge';

  override list(
    request: Partial<PagedDataRequestParam> = {}
  ): Observable<Array<KnowledgeBase>> {
    return this.http.get<Array<KnowledgeBase>>(
      `${environment.baseURL}/${this.path}/`
    );
  }

  createKnowledge(data: Partial<KnowledgeBase>): Observable<KnowledgeBase> {
    return this.http.post<KnowledgeBase>(
      `${environment.baseURL}/${this.path}/create`,
      data
    );
  }
}
