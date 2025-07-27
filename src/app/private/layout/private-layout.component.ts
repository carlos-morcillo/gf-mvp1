import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsideComponent } from './aside/aside.component';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [AsideComponent, RouterOutlet],
  templateUrl: './private-layout.component.html',
  styleUrls: ['./private-layout.component.scss']
})
export class PrivateLayoutComponent {
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }
}
