import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom, map } from 'rxjs';
import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';
import { Group, GroupService } from './group.service';
import { KnowledgeBaseService } from './knowledge-base.service';

@Component({
  selector: 'app-knowledge-base-edition',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NgSelectModule,
    TranslocoModule,
  ],
  templateUrl: './knowledge-base-edition.component.html',
})
export class KnowledgeBaseEditionComponent {
  #fb = inject(FormBuilder);
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  #kbSvc = inject(KnowledgeBaseService);
  #groupSvc = inject(GroupService);
  #transloco = inject(TranslocoService);

  knowledgeBaseId = toSignal(
    this.#route.paramMap.pipe(map((m) => m.get('knowledgeId')))
  );

  groups = signal<Group[]>([]);
  knowledge = signal<KnowledgeBase | null>(null);

  form = this.#fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    visibility: this.#fb.nonNullable.control('private'),
    groups: this.#fb.control<string[]>([]),
  });

  readonly isEditMode = computed(() => !!this.knowledgeBaseId());
  readonly formTitle = computed(() =>
    this.isEditMode()
      ? this.#transloco.translate('knowledgeBase.edit')
      : this.#transloco.translate('knowledgeBase.create')
  );

  constructor() {
    firstValueFrom(this.#groupSvc.getAvailableGroups()).then((gs) =>
      this.groups.set(gs)
    );

    const id = this.knowledgeBaseId();
    if (id) {
      firstValueFrom(this.#kbSvc.find(id)).then((kb) => {
        this.knowledge.set(kb);
        this.form.patchValue({
          name: kb.name,
          description: kb.description,
          groups: kb.access_control?.['read']?.group_ids || [],
        });
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: Partial<KnowledgeBase> = {
      name: value.name,
      description: value.description,
      access_control: {
        read: { group_ids: value.groups || [], user_ids: [] },
        write: { group_ids: value.groups || [], user_ids: [] },
      },
    };

    const request = this.isEditMode()
      ? this.#kbSvc.updateKnowledgeBase(this.knowledgeBaseId()!, payload)
      : this.#kbSvc.createKnowledgeBase(payload);

    request.subscribe((kb) => {
      this.#router.navigate(['/private/knowledge-bases', kb.id]);
    });
  }
}
