import { Component, inject, input, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';
import { FileUploadComponent } from './file-upload.component';
import { FileService } from './file.service';
import { KnowledgeBaseService } from './knowledge-base.service';

@Component({
  selector: 'app-knowledge-base-detail',
  standalone: true,
  imports: [FileUploadComponent, RouterLink, TranslocoModule],
  templateUrl: './knowledge-base-detail.component.html',
})
export class KnowledgeBaseDetailComponent {
  #kbSvc = inject(KnowledgeBaseService);
  #fileSvc = inject(FileService);

  knowledge = input.required<KnowledgeBase>({ alias: 'knowledge' });

  files = resource({
    params: () => ({ knowledge: this.knowledge() }),
    loader: ({ params: { knowledge } }) =>
      firstValueFrom(this.#fileSvc.getKnowledgeFiles(knowledge.id)),
  });
}
