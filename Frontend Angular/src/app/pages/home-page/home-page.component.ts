import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Product } from '../../models';
import { getToastCategoryClass } from '../../shared/product-ui';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: true,
  imports: [ProductCardComponent, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  featuredProducts: Product[] = [];
  loadingError = '';

  constructor(
    private readonly products: ProductService,
    private readonly cart: CartService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {
    this.products.loadProducts().subscribe({
      next: (productList) => {
        const featuredOrder = [9, 1, 3];
        const preferred = featuredOrder
          .map((id) => productList.find((product) => product.id === id))
          .filter((product): product is Product => Boolean(product));

        const fallback = productList.filter((p) => !preferred.some((f) => f.id === p.id)).slice(0, Math.max(0, 3 - preferred.length));
        this.featuredProducts = [...preferred, ...fallback].slice(0, 3);
      },
      error: () => {
        this.loadingError = 'Unable to load featured products right now.';
      }
    });
  }

  addToCart(product: Product): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please login to add items to your cart');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }

    if (this.auth.isAdmin()) {
      this.toast.show('Admins can manage products, but cannot place customer orders');
      return;
    }

    this.cart.addToCart(product, 1);
    this.toast.show(`${product.name} added to cart`, getToastCategoryClass(product.category || 'General'));
  }
}
