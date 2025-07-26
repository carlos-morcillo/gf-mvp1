import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {}
