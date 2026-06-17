import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartItem } from '../../models';
import { ShopCurrencyPipe } from '../../pipes/shop-currency.pipe';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: true,
  imports: [RouterLink, ShopCurrencyPipe],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css'
})
export class CartPageComponent {
  items: CartItem[] = [];

  constructor(
    readonly cart: CartService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {
    this.loadCart();
  }

  loadCart(): void {
    this.items = this.cart.getCart();
  }

  summary() {
    return this.cart.getSummary(this.items);
  }

  increase(item: CartItem): void {
    this.cart.updateQuantity(item.productId, item.quantity + 1);
    this.loadCart();
  }

  decrease(item: CartItem): void {
    this.cart.updateQuantity(item.productId, item.quantity - 1);
    if (item.quantity <= 1) {
      this.toast.show('Item removed from cart');
    }
    this.loadCart();
  }

  updateQuantity(id: number, quantity: number): void {
    this.cart.updateQuantity(id, quantity);
    this.loadCart();
  }

  remove(id: number): void {
    this.cart.removeFromCart(id);
    this.toast.show('Item removed from cart');
    this.loadCart();
  }

  clearCart(): void {
    this.cart.clearCart();
    this.toast.show('Cart cleared');
    this.loadCart();
  }

  proceedToCheckout(): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please login before checkout');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    if (this.auth.isAdmin()) {
      this.toast.show('Admins cannot place customer orders');
      return;
    }

    this.router.navigateByUrl('/checkout');
  }
}
