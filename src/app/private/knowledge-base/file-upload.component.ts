import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { KnowledgeBaseService } from './knowledge-base.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="my-3" [class.opacity-50]="!knowledgeBaseId">
      <input
        type="file"
        class="form-control"
        multiple
        (change)="onFiles($event)"
        [disabled]="!knowledgeBaseId || uploading()"
      />
      <div class="progress mt-2" *ngIf="uploading()">
        <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
      </div>
    </div>
  `,
})
export class FileUploadComponent {
  @Input() knowledgeBaseId: string | null = null;
  uploading = signal(false);

  constructor(private kbSvc: KnowledgeBaseService) {}

  onFiles(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || !this.knowledgeBaseId) return;
    this.uploading.set(true);
    this.kbSvc.uploadFiles(this.knowledgeBaseId, files).subscribe({
      next: () => this.uploading.set(false),
      error: () => this.uploading.set(false),
    });
  }
}
