import { Component, DOCUMENT, Inject, OnInit, Renderer2 } from '@angular/core';

import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
})
export class TrainingComponent implements OnInit {
  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    const link = this.renderer.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.tailwindcss.com'; // tu URL aquí
    this.renderer.appendChild(this.document.head, link);
  }
}
