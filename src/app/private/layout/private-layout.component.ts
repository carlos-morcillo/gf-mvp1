import { Component, inject, signal } from '@angular/core';
import { PinnedAgentsService } from '../../shared/services';

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

  pinnedSvc = inject(PinnedAgentsService);
}
