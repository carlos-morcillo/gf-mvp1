import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private _token = signal<string | null>(localStorage.getItem('token'));

  /** Readonly token signal */
  readonly token = this._token.asReadonly();

  /** Emits true when a token exists */
  readonly isLoggedIn = computed(() => !!this._token());

  /** Performs the login request and stores the received JWT */
  login(payload: LoginPayload) {
    return this.http
      .post<LoginResponse>(`${environment.baseURL}/auths/signin`, payload)
      .pipe(tap((res) => this.setToken(res.token)));
  }

  /** Registers a new company in the backend */
  registerCompany(payload: RegisterPayload) {
    return this.http.post('/api/register', payload);
  }

  /** Clears the stored token */
  logout(): void {
    this.setToken(null);
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
