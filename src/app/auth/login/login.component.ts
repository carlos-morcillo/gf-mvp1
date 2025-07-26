import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslocoModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  loading = signal(false);

  /** Active authentication tab */
  tab = signal<'standard' | 'ldap'>('standard');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ldapForm = this.fb.nonNullable.group({
    user: ['', Validators.required],
    password: ['', Validators.required],
  });

  /** Handles form submission and navigates on success */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/home');
      },
      error: () => this.loading.set(false),
    });
  }

  /** Handles LDAP form submission */
  submitLdap(): void {
    if (this.ldapForm.invalid) {
      this.ldapForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.loginLdap(this.ldapForm.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/home');
      },
      error: () => this.loading.set(false),
    });
  }
}
