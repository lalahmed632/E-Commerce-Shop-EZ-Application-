import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(
    readonly cart: CartService,
    readonly toast: ToastService,
    readonly auth: AuthService,
    private readonly router: Router
  ) {}

  cartCount(items = this.cart.getCart()): number {
    return this.cart.getSummary(items).itemCount;
  }

  closeMobileMenu(): void {
    const menuElement = document.getElementById('mainNav');
    if (!menuElement || window.innerWidth >= 992) {
      return;
    }

    const bootstrapApi = (window as Window & { bootstrap?: { Offcanvas?: { getOrCreateInstance: (element: Element) => { hide: () => void } } } }).bootstrap;
    bootstrapApi?.Offcanvas?.getOrCreateInstance(menuElement)?.hide();
  }

  logout(): void {
    this.auth.logout();
    this.closeMobileMenu();
    this.router.navigateByUrl('/');
  }
}
