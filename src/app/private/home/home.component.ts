import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
