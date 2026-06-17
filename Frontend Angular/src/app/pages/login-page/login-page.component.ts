import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getApiErrorMessage } from '../../services/api-error';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  email = '';
  password = '';
  busy = false;
  error = '';

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  login(): void {
    this.busy = true;
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl()),
      error: (error) => {
        this.error = getApiErrorMessage(error);
        this.busy = false;
      }
    });
  }

  useCustomerDemo(): void {
    this.email = 'customer@shopez.com';
    this.password = 'Pass@123';
  }

  useAdminDemo(): void {
    this.email = 'admin@shopez.com';
    this.password = 'Admin@123';
  }

  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl') || '/products';
    return url.startsWith('/') ? url : '/products';
  }
}
