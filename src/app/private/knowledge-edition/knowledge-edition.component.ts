
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgSelectModule } from '@ng-select/ng-select';
import { Toast } from '../../shared/services/toast.service';
import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';
import { KnowledgeService } from '../knowledge-list/knowledge.service';

@Component({
  selector: 'app-knowledge-edition',
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoModule, NgSelectModule],
  templateUrl: './knowledge-edition.component.html',
})
export class KnowledgeEditionComponent {
  fb = inject(FormBuilder);
  knowledgeSvc = inject(KnowledgeService);
  transloco = inject(TranslocoService);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    data: this.fb.control<Record<string, any>>({}, { nonNullable: true }),
    access_control: this.fb.control<Record<string, any>>(
      {},
      { nonNullable: true }
    ),
  });

  constructor() {}

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.knowledgeSvc
      .createKnowledge(this.form.value as Partial<KnowledgeBase>)
      .subscribe(() => {
        Toast.success(
          this.transloco.translate('KNOWLEDGE_EDITION.FORM.SUCCESS')
        );
      });
  }
}
