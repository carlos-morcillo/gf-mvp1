
import { Component, inject, resource } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgSelectModule } from '@ng-select/ng-select';
import { firstValueFrom } from 'rxjs';
import { Agent } from '../agent-list/agent';
import { AgentsService } from '../agent-list/agents.service';

@Component({
  selector: 'app-agent-edition',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, TranslocoModule],
  templateUrl: './agent-edition.component.html',
  styleUrl: './agent-edition.component.scss',
})
export class AgentEditionComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private agentsSvc = inject(AgentsService);

  /** Mock base model options */
  modelsResource = resource({
    loader: () => {
      return firstValueFrom(this.agentsSvc.baseModels());
    },
  });

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    base_model_id: ['', Validators.required],
    description: [''],
    profile_image_url: [''],
    is_active: this.fb.nonNullable.control(true),
  });

  imagePreview = '';

  /** Reads file as base64 and stores in the form */
  private readImage(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.form.patchValue({ profile_image_url: this.imagePreview });
    };
    reader.readAsDataURL(file);
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.readImage(file);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.readImage(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: Agent = {
      id: '',
      base_model_id: value.base_model_id,
      name: value.name,
      meta: {
        profile_image_url: value.profile_image_url || '/static/favicon.png',
        description: value.description,
        capabilities: {},
      },
      params: {},
      access_control: {},
      is_active: value.is_active,
    } as Agent;

    this.agentsSvc.createAgent(payload).subscribe(() => {
      this.router.navigate(['/private/agents']);
    });
  }
}
