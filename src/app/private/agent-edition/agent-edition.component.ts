import { KeyValuePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, resource } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgSelectModule } from '@ng-select/ng-select';
import { firstValueFrom } from 'rxjs';
import { Agent } from '../agent-list/agent';
import { AgentsService } from '../agent-list/agents.service';
import { KnowledgeService } from '../knowledge-list/knowledge.service';
import { AgentSkill } from './agent-skill.enum';

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
    KeyValuePipe,
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

  /** Expose enum to the template */
  readonly AgentSkill = AgentSkill;

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

  /** Reactive form describing the agent */
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    tone: this.fb.nonNullable.control('', Validators.required),
    persona: [''],
    welcomeMessage: [''],
    context: [''],
    outputFormat: [''],
    skills: this.fb.nonNullable.control<AgentSkill[]>([]),
    knowledgeIds: this.fb.nonNullable.control<string[]>([]),
    base_model_id: ['', Validators.required],
    profile_image_url: [''],
    is_active: this.fb.nonNullable.control(true),
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

  /**
   * Converts individual form fields into the text block expected by the backend.
   */
  private buildDescription(): string {
    const v = this.form.getRawValue();
    return `TONE: ${v.tone}\nPERSONALITY: ${v.persona}\nWELCOME_MESSAGE: ${v.welcomeMessage}\nCONTEXT: ${v.context}\nOUTPUT_FORMAT: ${v.outputFormat}`;
  }

  /**
   * Parses the description block and returns the corresponding values.
   */
  private parseDescription(text: string): Partial<Record<string, string>> {
    const result: any = {};
    const regex = /^([A-Z_]+):\s*(.*)$/gm;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text))) {
      switch (match[1]) {
        case 'TONE':
          result.tone = match[2];
          break;
        case 'PERSONALITY':
          result.persona = match[2];
          break;
        case 'WELCOME_MESSAGE':
          result.welcomeMessage = match[2];
          break;
        case 'CONTEXT':
          result.context = match[2];
          break;
        case 'OUTPUT_FORMAT':
          result.outputFormat = match[2];
          break;
      }
    }
    return result;
  }

  /** Patches the form with agent data when editing */
  private patchForm(agent: Agent): void {
    const desc = this.parseDescription(agent.meta.description || '');
    this.imagePreview = agent.meta.profile_image_url;
    this.form.patchValue({
      name: agent.name,
      base_model_id: agent.base_model_id,
      tone: desc['tone'],
      persona: desc['persona'],
      welcomeMessage: desc['welcomeMessage'],
      context: desc['context'],
      outputFormat: desc['outputFormat'],
      skills: Object.keys(agent.meta.capabilities || {}) as AgentSkill[],
      knowledgeIds: (agent.meta as any).knowledgeIds || [],
      profile_image_url: agent.meta.profile_image_url,
      is_active: agent.is_active,
    });
  }

  /** Submits the form creating or updating the agent */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: Partial<Agent> = {
      base_model_id: value.base_model_id,
      name: value.name,
      meta: {
        profile_image_url: value.profile_image_url || '/static/favicon.png',
        description: this.buildDescription(),
        capabilities: value.skills.reduce((acc, s) => {
          acc[s] = true;
          return acc;
        }, {} as Record<string, boolean>),
        // knowledgeIds: value.knowledgeIds,
      },
      params: {},
      access_control: {},
      is_active: value.is_active,
    } as Agent;

    const request = this.agentId
      ? this.agentsSvc.updateAgent(this.agentId, payload)
      : this.agentsSvc.createAgent(payload as Agent);

    request.subscribe(() => {
      this.router.navigate(['/private/agents']);
    });
  }

  onSkillChange(skill: any) {
    console.log(skill);
    // form.value.skills?.includes(skill) ? form.patchValue({skills: form.value.skills?.filter(s => s !== skill)}) : form.patchValue({skills: [...form.value.skills, skill]})
  }
}
