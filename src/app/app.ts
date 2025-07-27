import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'gf-mvp1';

  transloco = inject(TranslocoService);

  constructor() {
    const lang = localStorage.getItem('language') || 'es';
    this.transloco.setActiveLang(lang);
  }
}
