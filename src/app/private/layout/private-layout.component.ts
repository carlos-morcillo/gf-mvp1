import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './private-layout.component.html'
})
export class PrivateLayoutComponent {
  /** Controls offcanvas visibility on small screens */
  menuOpen = signal(false);
}
