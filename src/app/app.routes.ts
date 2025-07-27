import { Routes } from '@angular/router';
import { UserResolver } from './auth/resolvers/user.resolver';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
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
    resolve: { user: UserResolver },
    loadChildren: () =>
      import('./private/private.routes').then((m) => m.PRIVATE_ROUTES),
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./error-page/error-page.component').then(
        (m) => m.ErrorPageComponent
      ),
  },
  { path: '', redirectTo: 'private', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
