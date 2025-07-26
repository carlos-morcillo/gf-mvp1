import { TitleCasePipe } from '@angular/common';
import { Component, inject, resource } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgSelectModule } from '@ng-select/ng-select';
import { firstValueFrom } from 'rxjs';
import { Agent } from '../agent-list/agent';
import { AgentsService } from '../agent-list/agents.service';
import { KnowledgeService } from '../knowledge-list/knowledge.service';
import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';
import {
  AgentCapability,
  AGENT_CAPABILITIES,
} from './agent-capability.enum';

/**
 * Component used for both creation and edition of AI agents.
 * All agent configuration fields are stored in a reactive form.
 */
@Component({
  selector: 'app-agent-edition',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    TranslocoModule,
    TitleCasePipe,
  ],
  templateUrl: './agent-edition.component.html',
  styleUrl: './agent-edition.component.scss',
})
export class AgentEditionComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private agentsSvc = inject(AgentsService);
  private knowledgeSvc = inject(KnowledgeService);

  /** Capabilities displayed in the template */
  readonly capabilities = AGENT_CAPABILITIES;

  /** Base models available in the backend */
  modelsResource = resource({
    loader: () => firstValueFrom(this.agentsSvc.baseModels()),
  });

  /** Knowledge bases that can be linked to the agent */
  knowledgeResource = resource({
    loader: () => firstValueFrom(this.knowledgeSvc.list()),
  });

  /** Identifier of the agent if editing */
  agentId: string | null = this.route.snapshot.paramMap.get('id');

  /** Reactive form mirroring the Agent JSON structure */
  form = this.fb.nonNullable.group({
    id: [''],
    user_id: [''],
    base_model_id: this.fb.nonNullable.control('', Validators.required),
    name: this.fb.nonNullable.control('', Validators.required),
    params: this.fb.group({
      system: [''],
    }),
    meta: this.fb.group({
      profile_image_url: [''],
      description: [''],
      capabilities: this.createCapabilitiesGroup(),
      suggestion_prompts: this.fb.control<any[]>([]),
      tags: this.fb.control<string[]>([]),
      knowledge: this.fb.control<KnowledgeBase[]>([]),
    }),
    access_control: this.fb.group({
      read: this.fb.group({
        group_ids: this.fb.control<string[]>([]),
        user_ids: this.fb.control<string[]>([]),
      }),
      write: this.fb.group({
        group_ids: this.fb.control<string[]>([]),
        user_ids: this.fb.control<string[]>([]),
      }),
    }),
    is_active: this.fb.nonNullable.control(true),
    updated_at: this.fb.control<number | null>(null),
    created_at: this.fb.control<number | null>(null),
  });

  /** Attached files */
  files: File[] = [];

  /** Preview of the profile image */
  imagePreview = '';

  constructor() {
    const resolved = this.route.snapshot.data['agent'] as Agent | null;
    if (resolved) {
      this.agentId = resolved.id;
      this.patchForm(resolved);
    }
  }

  /** Reads a file as Base64 and sets it as profile image */
  private readImage(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.form.patchValue({ profile_image_url: this.imagePreview });
    };
    reader.readAsDataURL(file);
  }

  onImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.readImage(file);
    }
  }

  onFileSelect(event: Event): void {
    const selected = Array.from((event.target as HTMLInputElement).files || []);
    this.files.push(...selected);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.readImage(file);
    }
  }


  /** Patches the form with agent data when editing */
  private patchForm(agent: Agent): void {
    this.imagePreview = agent.meta.profile_image_url;
    this.form.patchValue(agent);
    this.parseCapabilitiesToForm(agent.meta.capabilities);
  }

  /** Submits the form creating or updating the agent */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: Agent = {
      ...value,
      meta: {
        ...value.meta,
        capabilities: this.composeCapabilitiesFromForm(),
      },
    } as Agent;

    const request = this.agentId
      ? this.agentsSvc.updateAgent(this.agentId, payload)
      : this.agentsSvc.createAgent(payload as Agent);

    request.subscribe(() => {
      this.router.navigate(['/private/agents']);
    });
  }

  /**
   * Parses the capabilities object received from the backend into the form
   * group controls.
   */
  private parseCapabilitiesToForm(capabilities: Partial<Record<string, boolean>>): void {
    const group = this.form.controls.meta.controls.capabilities;
    for (const key of this.capabilities) {
      group.controls[key].setValue(!!capabilities?.[key]);
    }
  }

  /**
   * Composes a capabilities object to be sent to the backend based on the form
   * values.
   */
  private composeCapabilitiesFromForm(): Record<string, boolean> {
    const group = this.form.controls.meta.controls.capabilities;
    const result: Record<string, boolean> = {};
    for (const key of this.capabilities) {
      result[key] = group.controls[key].value;
    }
    return result;
  }

  /** Creates the capabilities form group with all controls set to false */
  private createCapabilitiesGroup() {
    return this.fb.group({
      vision: this.fb.nonNullable.control(false),
      file_upload: this.fb.nonNullable.control(false),
      web_search: this.fb.nonNullable.control(false),
      image_generation: this.fb.nonNullable.control(false),
      code_interpreter: this.fb.nonNullable.control(false),
      citations: this.fb.nonNullable.control(false),
      usage: this.fb.nonNullable.control(false),
    });
  }
}
