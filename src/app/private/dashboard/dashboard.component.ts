import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  metrics = [
    { title: 'Formaciones completadas', value: 12 },
    { title: 'Documentos indexados', value: 340 },
    { title: 'Puntuaci\u00f3n media', value: '4.5/5' },
    { title: 'Agentes activos', value: 5 }
  ];

  actions = ['Nuevo documento', 'Crear agente', 'Lanzar training'];

  logs = [
    'Usuario Juan cre\u00f3 un agente',
    'Se index\u00f3 el documento Manual.pdf',
    'Actualizada la formaci\u00f3n B\u00e1sica'
  ];
}
