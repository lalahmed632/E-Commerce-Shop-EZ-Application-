import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Product } from '../../models';
import { getToastCategoryClass } from '../../shared/product-ui';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: true,
  imports: [FormsModule, ProductCardComponent, RouterLink],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.css'
})
export class ProductsPageComponent {
  products: Product[] = [];
  searchTerm = '';
  selectedCategory = 'all';
  loadingError = '';

  categories(): string[] {
    return this.productService.getCategories(this.products);
  }

  filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.products.filter((product) => {
      const byCategory = this.selectedCategory === 'all' || (product.category || 'General') === this.selectedCategory;
      const bySearch = product.name.toLowerCase().includes(term);
      return byCategory && bySearch;
    });
  }

  constructor(
    private readonly productService: ProductService,
    private readonly cart: CartService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {
    this.productService.loadProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: () => {
        this.loadingError = 'Unable to load products right now.';
      }
    });
  }

  addToCart(product: Product): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please login to add items to your cart');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/products' } });
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
