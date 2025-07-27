import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';
import { FileUploadComponent } from './file-upload.component';

@Component({
  selector: 'app-knowledge-base-detail',
  standalone: true,
  imports: [FileUploadComponent, RouterLink, TranslocoModule],
  templateUrl: './knowledge-base-detail.component.html',
})
export class KnowledgeBaseDetailComponent {
  knowledge = input.required<KnowledgeBase>({ alias: 'knowledge' });
}
