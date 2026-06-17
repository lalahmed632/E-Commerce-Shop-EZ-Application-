import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../models';
import { getCategoryClass, getToastCategoryClass } from '../../shared/product-ui';
import { ShopCurrencyPipe } from '../../pipes/shop-currency.pipe';
import { StockStatusDirective } from '../../directives/stock-status.directive';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: true,
  imports: [RouterLink, ShopCurrencyPipe, StockStatusDirective],
  templateUrl: './product-details-page.component.html',
  styleUrl: './product-details-page.component.css'
})
export class ProductDetailsPageComponent {
  product?: Product;
  quantity = 1;
  message = 'Loading product details...';

  constructor(
    route: ActivatedRoute,
    private readonly products: ProductService,
    readonly cart: CartService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {
    const productId = Number(route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(productId) || productId <= 0) {
      this.message = 'The product ID in the URL is invalid.';
      return;
    }

    this.products.getById(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.message = '';
      },
      error: () => {
        this.message = 'Unable to load product details right now.';
      }
    });
  }

  categoryClass(category: string): string {
    return getCategoryClass(category || 'General');
  }

  changeQuantity(delta: number): void {
    this.quantity = this.normalizeQuantity(this.quantity + delta);
  }

  setQuantity(value: number): void {
    this.quantity = this.normalizeQuantity(value);
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please login to add items to your cart');
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/products/${this.product.id}` } });
      return;
    }

    if (this.auth.isAdmin()) {
      this.toast.show('Admins can manage products, but cannot place customer orders');
      return;
    }

    this.cart.addToCart(this.product, this.quantity);
    this.toast.show(`${this.product.name} added to cart`, getToastCategoryClass(this.product.category || 'General'));
  }

  private normalizeQuantity(value: number): number {
    const stockLimit = this.product ? Math.max(1, this.product.stock) : 10;
    return Math.max(1, Math.min(10, stockLimit, Math.floor(Number(value) || 1)));
  }
}
