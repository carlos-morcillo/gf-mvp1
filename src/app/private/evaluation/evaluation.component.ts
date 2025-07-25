import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './evaluation.component.html'
})
export class EvaluationComponent {}
