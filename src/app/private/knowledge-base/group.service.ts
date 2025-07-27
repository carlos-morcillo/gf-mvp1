import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Group {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class GroupService {
  #http = inject(HttpClient);

  getAvailableGroups(): Observable<Group[]> {
    return this.#http.get<Group[]>(`${environment.baseURL}/groups`);
  }
}
