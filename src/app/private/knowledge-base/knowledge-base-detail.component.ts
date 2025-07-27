import { CommonModule } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';
import { FileUploadComponent } from './file-upload.component';
import { KnowledgeBaseService, KnowledgeFile } from './knowledge-base.service';
import { FileService } from './file.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-knowledge-base-detail',
  standalone: true,
  imports: [CommonModule, FileUploadComponent, RouterLink, TranslocoModule],
  templateUrl: './knowledge-base-detail.component.html',
})
export class KnowledgeBaseDetailComponent {
  #kbSvc = inject(KnowledgeBaseService);
  #fileSvc = inject(FileService);

  id = input.required<string>({ alias: 'knowledgeId' });
  knowledge = input.required<KnowledgeBase>({ alias: 'knowledge' });

  files = signal<KnowledgeFile[]>([]);
  isLoadingFiles = signal(false);

  constructor() {
    this.loadFiles();
  }

  async loadFiles() {
    if (!this.id()) return;
    this.isLoadingFiles.set(true);
    try {
      const result = await firstValueFrom(
        this.#fileSvc.getKnowledgeFiles(this.id())
      );
      this.files.set(result);
    } finally {
      this.isLoadingFiles.set(false);
    }
  }
}
