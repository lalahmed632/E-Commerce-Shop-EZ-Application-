import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getApiErrorMessage } from '../../services/api-error';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  name = '';
  email = '';
  password = '';
  submitted = false;
  busy = false;
  error = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  register(): void {
    this.submitted = true;
    this.name = this.name.trim();
    this.email = this.email.trim();
    this.busy = true;
    this.error = '';
    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/products'),
      error: (error) => {
        this.error = getApiErrorMessage(error);
        this.busy = false;
      }
    });
  }
}
