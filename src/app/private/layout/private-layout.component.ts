import { Component, inject, signal } from '@angular/core';
import { PinnedAgentsService } from '../../shared/services';
import { AuthService } from '../../auth/auth.service';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AvatarComponent } from 'ng-hub-ui-avatar';
import { LANGUAGES } from '../../shared/constants';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FormsModule, TranslocoModule, AvatarComponent],
  templateUrl: './private-layout.component.html'
})
export class PrivateLayoutComponent {
  /** Controls offcanvas visibility on small screens */
  menuOpen = signal(false);

  pinnedSvc = inject(PinnedAgentsService);
  auth = inject(AuthService);
  transloco = inject(TranslocoService);

  /** Available languages list */
  languages = LANGUAGES;
  /** Current active language */
  currentLang = signal(localStorage.getItem('language') || 'es');

  user = this.auth.user;

  constructor() {
    this.transloco.setActiveLang(this.currentLang());
  }

  changeLang(lang: string) {
    this.currentLang.set(lang);
    this.transloco.setActiveLang(lang);
    localStorage.setItem('language', lang);
  }

  logout(): void {
    this.auth.logout();
  }
}
