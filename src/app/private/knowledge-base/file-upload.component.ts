import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { KnowledgeBaseService } from './knowledge-base.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="my-3" [class.opacity-50]="!knowledgeBaseId()">
      <input
        type="file"
        class="form-control"
        multiple
        (change)="onFiles($event)"
        [disabled]="!knowledgeBaseId() || uploading()"
      />
      <div class="progress mt-2" *ngIf="uploading()">
        <div
          class="progress-bar progress-bar-striped progress-bar-animated"
          style="width: 100%"
        ></div>
      </div>
    </div>
  `,
})
export class FileUploadComponent {
  readonly knowledgeBaseId = input<string | null>(null);
  uploading = signal(false);

  constructor(private kbSvc: KnowledgeBaseService) {}

  async onFiles(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    const knowledgeBaseId = this.knowledgeBaseId();
    if (!files || !knowledgeBaseId) return;
    this.uploading.set(true);

    try {
      const result = await firstValueFrom(
        this.kbSvc.uploadFiles(knowledgeBaseId, files)
      );
    } catch (error) {
      console.error(error);
    }
    this.uploading.set(false);
  }
}
