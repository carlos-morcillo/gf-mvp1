import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CollectionService } from '../../shared/services';
import { PagedDataRequestParam } from '../../shared/types/paged-data-request-param';
import { Agent } from './agent';

/**
 * Service to manage Agent collection interactions.
 */
@Injectable({ providedIn: 'root' })
export class AgentsService extends CollectionService<Agent> {
  /** Backend endpoint path */
  protected override path = 'models';

  override list(
    request: Partial<PagedDataRequestParam> = {}
  ): Observable<Array<Agent>> {
    // throw new Error('list not developed');
    return this.http.get<Array<Agent>>(`${environment.baseURL}/${this.path}/`);
  }

  /** Retrieves an agent by identifier */
  override find(id: string): Observable<Agent> {
    return this.http.get<Agent>(`${environment.baseURL}/${this.path}/model`, {
      params: { id },
    });
  }

  baseModels(
    request: Partial<PagedDataRequestParam> = {}
  ): Observable<Array<Agent>> {
    // throw new Error('list not developed');
    return this.http.get<Array<Agent>>(
      `${environment.baseURL}/${this.path}/base`
    );
  }

  /** Creates a new agent */
  createAgent(agent: Agent): Observable<Agent> {
    return this.http.post<Agent>(
      `${environment.baseURL}/${this.path}/create`,
      agent
    );
  }

  /** Updates an existing agent */
  updateAgent(id: string, agent: Partial<Agent>): Observable<Agent> {
    return this.http.put<Agent>(
      `${environment.baseURL}/${this.path}/${id}`,
      agent
    );
  }
}
