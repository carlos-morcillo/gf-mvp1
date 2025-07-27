import { CommonModule } from '@angular/common';
import { Component, Input, signal, computed, inject } from '@angular/core';
import { FileService } from './file.service';
import { KnowledgeFile } from './knowledge-base.service';
import { firstValueFrom } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';

interface FileUploadItem {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  id?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  template: `
    <div
      class="file-drop-zone"
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
    <div class="mt-3" *ngFor="let item of uploadQueue()">
      <div class="progress" *ngIf="item.status === 'uploading'">
        <div
          class="progress-bar"
          role="progressbar"
          [style.width.%]="item.progress"
        ></div>
      </div>
      <div *ngIf="item.status === 'completed'" class="text-success">
        {{ item.file.name }} - {{ 'fileUpload.success' | transloco }}
      </div>
      <div *ngIf="item.status === 'error'" class="text-danger">
        {{ item.file.name }} - {{ 'fileUpload.error' | transloco }}
      </div>
    </div>
  `,
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent {
  @Input() knowledgeBaseId: string | null = null;

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
    if (!this.knowledgeBaseId) return;
    for (const file of files) {
      const item: FileUploadItem = { file, progress: 0, status: 'pending' };
      this.uploadQueue.update((q) => [...q, item]);
      try {
        item.status = 'uploading';
        const uploaded = await firstValueFrom(this.#fileSvc.uploadFile(file));
        await firstValueFrom(
          this.#fileSvc.associateFileToKnowledge(
            this.knowledgeBaseId!,
            uploaded.file_id
          )
        );
        item.status = 'completed';
        item.id = uploaded.file_id;
      } catch {
        item.status = 'error';
      }
    }
  }
}
