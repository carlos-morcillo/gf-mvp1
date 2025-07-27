import { Component, computed, inject, input, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { FileService } from './file.service';

interface FileUploadItem {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  id?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <div
      class="file-drop-zone alert alert-secondary text-center p-4 border-primary"
      [class.drag-over]="dragOver"
      (drop)="onDrop($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (click)="fileInput.click()"
    >
      <p class="m-0">
        {{ 'fileUpload.dragDropText' | transloco }}
      </p>
      <input
        type="file"
        class="d-none"
        #fileInput
        multiple
        (change)="onFiles($event)"
      />
    </div>
    @for (item of uploadQueue(); track item) {
    <div class="mt-3">
      @if (item.status === 'uploading') {
      <div class="progress">
        <div
          class="progress-bar"
          role="progressbar"
          [style.width.%]="item.progress"
        ></div>
      </div>
      } @if (item.status === 'completed') {
      <div class="alert-success">
        {{ item.file.name }} - {{ 'fileUpload.success' | transloco }}
      </div>
      } @if (item.status === 'error') {
      <div class="alert-danger">
        {{ item.file.name }} - {{ 'fileUpload.error' | transloco }}
      </div>
      }
    </div>
    }
  `,
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent {
  readonly knowledgeBaseId = input<string | null>(null);

  uploadQueue = signal<FileUploadItem[]>([]);
  dragOver = false;

  #fileSvc = inject(FileService);

  isUploading = computed(() =>
    this.uploadQueue().some((i) => i.status === 'uploading')
  );

  onDragOver(evt: DragEvent) {
    evt.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    this.dragOver = false;
  }

  onDrop(evt: DragEvent) {
    evt.preventDefault();
    this.dragOver = false;
    const files = Array.from(evt.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  onFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.handleFiles(files);
    input.value = '';
  }

  private async handleFiles(files: File[]) {
    const knowledgeBaseId = this.knowledgeBaseId();
    if (!knowledgeBaseId) return;
    for (const file of files) {
      const item: FileUploadItem = { file, progress: 0, status: 'pending' };
      this.uploadQueue.update((q) => [...q, item]);
      try {
        item.status = 'uploading';
        const uploaded = await firstValueFrom(this.#fileSvc.uploadFile(file));
        debugger;
        await firstValueFrom(
          this.#fileSvc.associateFileToKnowledge(knowledgeBaseId!, uploaded.id)
        );
        item.status = 'completed';
        item.id = uploaded.id;
      } catch {
        item.status = 'error';
      }
    }
  }
}
