import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './error-page.component.html',
})
export class ErrorPageComponent {}
