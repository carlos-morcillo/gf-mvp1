import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { KnowledgeBaseService } from './knowledge-base.service';
import { FileUploadComponent } from './file-upload.component';
import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';

@Component({
  selector: 'app-knowledge-base-detail',
  standalone: true,
  imports: [CommonModule, FileUploadComponent],
  templateUrl: './knowledge-base-detail.component.html',
})
export class KnowledgeBaseDetailComponent {
  #route = inject(ActivatedRoute);
  #kbSvc = inject(KnowledgeBaseService);

  id = toSignal(this.#route.paramMap.pipe(map((m) => m.get('knowledgeId')!)));

  knowledge = signal<KnowledgeBase | null>(null);

  constructor() {
    const id = this.id() as string;
    firstValueFrom(this.#kbSvc.getKnowledgeBase(id)).then((kb) =>
      this.knowledge.set(kb)
    );
  }
}
