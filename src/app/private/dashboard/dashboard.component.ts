import { Component } from '@angular/core';


import { TranslocoModule } from "@jsverse/transloco";
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  metrics = [
    { title: 'DASHBOARD.METRICS.TRAININGS_COMPLETED', value: 12 },
    { title: 'DASHBOARD.METRICS.DOCUMENTS_INDEXED', value: 340 },
    { title: 'DASHBOARD.METRICS.AVERAGE_SCORE', value: '4.5/5' },
    { title: 'DASHBOARD.METRICS.ACTIVE_AGENTS', value: 5 },
  ];

  actions = [
    'DASHBOARD.ACTIONS.NEW_DOC',
    'DASHBOARD.ACTIONS.NEW_AGENT',
    'DASHBOARD.ACTIONS.RUN_TRAINING',
  ];

  logs = [
    'DASHBOARD.LOGS.USER_CREATED_AGENT',
    'DASHBOARD.LOGS.DOC_INDEXED',
    'DASHBOARD.LOGS.TRAINING_UPDATED',
  ];
}
