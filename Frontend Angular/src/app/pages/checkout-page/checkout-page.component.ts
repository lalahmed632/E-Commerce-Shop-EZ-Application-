import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CartItem } from '../../models';
import { ShopCurrencyPipe } from '../../pipes/shop-currency.pipe';
import { getApiErrorMessage } from '../../services/api-error';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ShopCurrencyPipe],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css'
})
export class CheckoutPageComponent {
  items: CartItem[] = [];
  readonly checkoutForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.pattern(/\S/)]],
    lastName: ['', [Validators.required, Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(160), Validators.pattern(/^(?=.*[A-Za-z0-9])[A-Za-z0-9\s,.\-/#]+$/)]],
    city: ['', [Validators.required, Validators.pattern(/\S/)]],
    zip: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]]
  });

  submitted = false;
  placingOrder = false;
  orderPlaced = false;
  orderRef = '';
  orderTotal = 0;
  error = '';

  constructor(
    readonly cart: CartService,
    private readonly fb: FormBuilder,
    private readonly orders: OrderService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    if (this.auth.isAdmin()) {
      this.error = 'Admins cannot place customer orders. Use a customer account to checkout.';
      return;
    }

    this.items = this.cart.getCart();
  }

  summary() {
    return this.cart.getSummary(this.items);
  }

  placeOrder(): void {
    this.submitted = true;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    if (this.auth.isAdmin()) {
      this.error = 'Admins cannot place customer orders. Use a customer account to checkout.';
      return;
    }

    if (this.checkoutForm.invalid || this.items.length === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.placingOrder = true;
    this.error = '';
    const payableTotal = this.summary().total;
    this.orders
      .createOrder({
        items: this.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      })
      .pipe(finalize(() => {
        this.placingOrder = false;
      }))
      .subscribe({
        next: (order) => {
          this.orderRef = order.orderId > 0 ? String(order.orderId) : 'Confirmed';
          this.orderTotal = order.totalAmount || payableTotal;
          this.cart.clearCart();
          this.items = [];
          this.orderPlaced = true;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (error) => {
          this.error = getApiErrorMessage(error);
        }
      });
  }
}
