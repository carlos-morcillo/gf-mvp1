import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './training.component.html'
})
export class TrainingComponent {}
