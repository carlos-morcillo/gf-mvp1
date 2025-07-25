import { Component } from '@angular/core';

import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './training.component.html'
})
export class TrainingComponent {}
