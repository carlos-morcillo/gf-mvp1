import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';

export interface KnowledgeFile {
  id: string;
  meta: Record<string, any>;
  created_at: number;
  updated_at: number;
}

@Injectable({ providedIn: 'root' })
export class KnowledgeBaseService {
  #http = inject(HttpClient);
  #base = `${environment.baseURL}/knowledge`;

  createKnowledgeBase(data: Partial<KnowledgeBase>): Observable<KnowledgeBase> {
    return this.#http.post<KnowledgeBase>(`${this.#base}/create`, data);
  }

  updateKnowledgeBase(id: string, data: Partial<KnowledgeBase>): Observable<KnowledgeBase> {
    return this.#http.post<KnowledgeBase>(`${this.#base}/${id}/update`, data);
  }

  getKnowledgeBase(id: string): Observable<KnowledgeBase> {
    return this.#http.get<KnowledgeBase>(`${this.#base}/${id}`);
  }

  deleteKnowledgeBase(id: string): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/${id}/delete`);
  }

  uploadFiles(id: string, files: FileList): Observable<KnowledgeFile[]> {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('files', f));
    return this.#http.post<KnowledgeFile[]>(`${this.#base}/${id}/files/batch/add`, form);
  }
}
