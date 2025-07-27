import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';
import { FileUploadComponent } from './file-upload.component';
import { KnowledgeBaseService } from './knowledge-base.service';

@Component({
  selector: 'app-knowledge-base-detail',
  standalone: true,
  imports: [CommonModule, FileUploadComponent],
  templateUrl: './knowledge-base-detail.component.html',
})
export class KnowledgeBaseDetailComponent {
  #kbSvc = inject(KnowledgeBaseService);

  id = input.required<string>({ alias: 'knowledgeId' });
  knowledge = input.required<KnowledgeBase>({ alias: 'knowledge' });
}
