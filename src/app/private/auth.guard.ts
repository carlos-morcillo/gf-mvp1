import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/** Simple authentication guard */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const loggedIn = auth.isLoggedIn();
  if (!loggedIn) {
    return router.createUrlTree(['/login']);
  }

  if (state.url === '/login') {
    return router.createUrlTree(['/home']);
  }

  return true;
};
