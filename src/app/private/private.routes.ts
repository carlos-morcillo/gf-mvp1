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
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
      },
      {
        path: 'agents',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./agent-list/agent-list.component').then(
                (c) => c.AgentListComponent
              ),
          },
          {
            path: 'add',
            loadComponent: () =>
              import('./agent-edition/agent-edition.component').then(
                (c) => c.AgentEditionComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./agent-edition/agent-edition.component').then(
                (c) => c.AgentEditionComponent
              ),
          },
        ],
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
