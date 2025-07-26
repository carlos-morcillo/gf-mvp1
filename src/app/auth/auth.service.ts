import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
}
interface LoginPayload {
  email: string;
  password: string;
}
interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LdapPayload {
  user: string;
  password: string;
}

interface CurrentUser {
  name: string;
  email: string;
  avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(localStorage.getItem('token'));
  private _user = signal<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  readonly user = this._user.asReadonly();

  /** Readonly token signal */
  readonly token = this._token.asReadonly();

  /** Emits true when a token exists */
  readonly isLoggedIn = computed(() => !!this._token());

  /** Performs the login request and stores the received JWT */
  login(payload: LoginPayload) {
    return this.http
      .post<LoginResponse>(`${environment.baseURL}/auths/signin`, payload)
      .pipe(
        tap((res) => {
          this.setToken(res.token);
          this.setUser({ name: payload.email, email: payload.email });
        })
      );
  }

  /** Performs LDAP authentication and stores the received JWT */
  loginLdap(payload: LdapPayload) {
    return this.http
      .post<LoginResponse>(`${environment.baseURL}/auths/ldap`, payload)
      .pipe(
        tap((res) => {
          this.setToken(res.token);
          this.setUser({ name: payload.user, email: payload.user });
        })
      );
  }

  getUser() {
    if (this.isLoggedIn()) {
      return firstValueFrom(
        this.http.get<CurrentUser>(`${environment.baseURL}/auths/`)
      );
    } else {
      return null;
    }
  }

  /** Registers a new company in the backend */
  registerCompany(payload: RegisterPayload) {
    return this.http.post('/api/register', payload);
  }

  /** Clears the stored token */
  logout(): void {
    this.setToken(null);
    this.setUser(null);
    this.router.navigateByUrl('/login');
  }

  setLanguage(lang: string): void {
    localStorage.setItem('language', lang);
  }

  setUser(user: { name: string; email: string; avatar?: string } | null): void {
    this._user.set(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  /** Retrieves the current JWT value */
  getToken(): string | null {
    return this._token();
  }

  private setToken(token: string | null): void {
    this._token.set(token);
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
}
