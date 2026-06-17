import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models';
import { CartService } from './cart.service';

const AUTH_KEY = 'shopez_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  baseUrl = `${environment.apiBaseUrl}/api/auth`;
  currentUser: AuthResponse | null = this.loadUser();

  constructor(private readonly http: HttpClient, private readonly cart: CartService) {}

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(tap((user) => this.saveUser(user)));
  }

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(tap((user) => this.saveUser(user)));
  }

  logout(): void {
    this.cart.clearCart();
    localStorage.removeItem(AUTH_KEY);
    this.currentUser = null;
    this.cart.reloadCart();
  }

  getToken(): string | null {
    if (!this.currentUser) {
      return null;
    }

    return this.currentUser.token;
  }

  isLoggedIn(): boolean {
    if (!this.currentUser || !this.currentUser.token) {
      return false;
    }

    if (!this.currentUser.expiresAtUtc) {
      return true;
    }

    return new Date(this.currentUser.expiresAtUtc).getTime() > Date.now();
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return { headers };
  }

  private saveUser(user: AuthResponse): void {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    this.currentUser = user;
    this.cart.reloadCart();
  }

  private loadUser(): AuthResponse | null {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? (JSON.parse(stored) as AuthResponse) : null;
    } catch {
      return null;
    }
  }
}
