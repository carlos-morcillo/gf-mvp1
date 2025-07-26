import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { AuthService } from '../auth.service';

/** Resolver to fetch an agent before activating the edition route. */
@Injectable({ providedIn: 'root' })
export class UserResolver implements Resolve<any | null> {
  router = inject(Router);

  constructor(private authSvc: AuthService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<any | null> {
    const user = await this.authSvc.getUser();
    if (!user) {
      this.authSvc.logout();
      return null;
    }
    this.authSvc.setUser(user);
    return user;
  }
}
