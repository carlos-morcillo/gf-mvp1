import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CollectionService } from '../../shared/services';
import { PagedDataRequestParam } from '../../shared/types/paged-data-request-param';
import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';

export interface KnowledgeFile {
  id: string;
  meta: Record<string, any>;
  created_at: number;
  updated_at: number;
}

@Injectable({ providedIn: 'root' })
export class KnowledgeBaseService extends CollectionService<KnowledgeBase> {
  #http = inject(HttpClient);
  protected override path: string = 'knowledge';

  override list(
    request: Partial<PagedDataRequestParam> = {}
  ): Observable<Array<KnowledgeBase>> {
    return this.http.get<Array<KnowledgeBase>>(
      `${environment.baseURL}/${this.path}/`
    );
  }

  createKnowledgeBase(data: Partial<KnowledgeBase>): Observable<KnowledgeBase> {
    return this.#http.post<KnowledgeBase>(
      `${environment.baseURL}/${this.path}/create`,
      data
    );
  }

  updateKnowledgeBase(
    id: string,
    data: Partial<KnowledgeBase>
  ): Observable<KnowledgeBase> {
    return this.#http.post<KnowledgeBase>(
      `${environment.baseURL}/${this.path}/${id}/update`,
      data
    );
  }

  override find(id: string): Observable<KnowledgeBase> {
    return this.#http.get<KnowledgeBase>(
      `${environment.baseURL}/${this.path}/${id}`
    );
  }

  deleteKnowledgeBase(id: string): Observable<void> {
    return this.#http.delete<void>(
      `${environment.baseURL}/${this.path}/${id}/delete`
    );
  }

  uploadFiles(id: string, files: FileList): Observable<KnowledgeFile[]> {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('files', f));
    return this.#http.post<KnowledgeFile[]>(
      `${environment.baseURL}/${this.path}/${id}/files/batch/add`,
      form
    );
  }
}
