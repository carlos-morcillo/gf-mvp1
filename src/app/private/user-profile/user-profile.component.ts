import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AvatarComponent } from 'ng-hub-ui-avatar';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [TranslocoModule, AvatarComponent],
  template: `
    <div class="container py-4">
      <h1>{{ 'USER_PROFILE.TITLE' | transloco }}</h1>
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card text-center">
            <div class="card-body">
              <hub-avatar
                [name]="user()?.name"
                [src]="user()?.avatar"
                size="120"
              ></hub-avatar>
              <h5 class="card-title mt-3">{{ user()?.name }}</h5>
              <p class="mb-1">
                <strong>{{ 'USER_PROFILE.EMAIL' | transloco }}:</strong>
                {{ user()?.email }}
              </p>
              @if (user()?.role) {
                <p class="mb-1">
                  <strong>{{ 'USER_PROFILE.ROLE' | transloco }}:</strong>
                  {{ user()?.role }}
                </p>
              }
              @if (user()?.language) {
                <p class="mb-1">
                  <strong>{{ 'USER_PROFILE.LANGUAGE' | transloco }}:</strong>
                  {{ user()?.language }}
                </p>
              }
              <button class="btn btn-primary mt-3">
                {{ 'USER_PROFILE.EDIT_BUTTON' | transloco }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent {
  auth = inject(AuthService);
  user = this.auth.user;
}
