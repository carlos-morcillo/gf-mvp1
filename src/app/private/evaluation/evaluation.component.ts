import { Component } from '@angular/core';

import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './evaluation.component.html'
})
export class EvaluationComponent {}
