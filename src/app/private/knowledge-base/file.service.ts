import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FileUploadResponse {
  id: string;
  user_id: string;
  hash: string;
  filename: string;
  //   data: Data;
  //   meta: Meta;
  created_at: number;
  updated_at: number;
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
    debugger;
    return this.#http.post<void>(
      `${environment.baseURL}/knowledge/${knowledgeId}/file/add`,
      { file_id: fileId } as FileAssociationRequest
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
