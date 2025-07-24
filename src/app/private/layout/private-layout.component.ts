import { Component, signal } from '@angular/core';

import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './private-layout.component.html'
})
export class PrivateLayoutComponent {
  /** Controls offcanvas visibility on small screens */
  menuOpen = signal(false);
}
