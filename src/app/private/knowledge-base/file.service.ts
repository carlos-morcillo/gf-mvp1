import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { KnowledgeFile } from './knowledge-base.service';

export interface FileUploadResponse {
  file_id: string;
  name: string;
  size: number;
  type: string;
  upload_url?: string;
}

export interface FileAssociationRequest {
  file_id: string;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  #http = inject(HttpClient);

  uploadFile(file: File): Observable<FileUploadResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.#http.post<FileUploadResponse>(
      `${environment.baseURL}/files/`,
      form
    );
  }

  associateFileToKnowledge(
    knowledgeId: string,
    fileId: string
  ): Observable<void> {
    return this.#http.post<void>(
      `${environment.baseURL}/knowledge/${knowledgeId}/file/add`,
      { file_id: fileId } as FileAssociationRequest
    );
  }

  getKnowledgeFiles(knowledgeId: string): Observable<KnowledgeFile[]> {
    return this.#http.get<KnowledgeFile[]>(
      `${environment.baseURL}/knowledge/${knowledgeId}/files`
    );
  }

  removeFileFromKnowledge(
    knowledgeId: string,
    fileId: string
  ): Observable<void> {
    return this.#http.post<void>(
      `${environment.baseURL}/knowledge/${knowledgeId}/file/${fileId}/remove`,
      {}
    );
  }
}
