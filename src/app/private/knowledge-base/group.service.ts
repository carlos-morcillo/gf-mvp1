import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CollectionService } from '../../shared/services';
import { PagedDataRequestParam } from '../../shared/types/paged-data-request-param';

export interface Group {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class GroupService extends CollectionService<Group> {
  #http = inject(HttpClient);

  protected override path: string = 'groups';

  override list(request?: Partial<PagedDataRequestParam>): Observable<Group[]> {
    return this.http.get<Array<Group>>(`${environment.baseURL}/${this.path}/ `);
  }
}
