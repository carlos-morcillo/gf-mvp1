import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BootstrapTestComponent } from './bootstrap-test/bootstrap-test.component';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BootstrapTestComponent],
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
