import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { PrivateLayoutComponent } from './layout/private-layout.component';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: PrivateLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'agents',
        loadComponent: () => import('./agents/agent-list.component').then(m => m.AgentListComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
