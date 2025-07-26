import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./private/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent
      ),
    canActivate: [
      () => import('./private/auth.guard').then((m) => m.authGuard),
    ],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/create-company/create-company.component').then(
        (m) => m.CreateCompanyComponent
      ),
  },
  {
    path: 'private',
    loadChildren: () =>
      import('./private/private.routes').then((m) => m.PRIVATE_ROUTES),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
