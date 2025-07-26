import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [TranslocoModule],
  template: `<div class="container py-4"><h1>{{ 'PROFILE.TITLES.MAIN' | transloco }}</h1></div>`
})
export class UserProfileComponent {}
